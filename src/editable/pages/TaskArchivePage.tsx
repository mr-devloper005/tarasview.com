import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Globe, MapPin, Search, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { isUiHiddenTask, taskDisplayLabel } from '@/editable/content/global.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return dedupeUrls([...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])]).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const stripHtml = (value: string) =>
  value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').split(/[/?#]/)[0]

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
}

const cardBase =
  'group flex h-full flex-col rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskDisplayLabel(task, taskConfig?.label)
  const categoryLabel =
    category === 'all' ? 'All collections' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const hidden = isUiHiddenTask(task)
  const showInFeedAd = task === 'sbm' && !hidden

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-28 sm:px-8 lg:px-10">
            <EditableReveal index={0}>
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--tk-text)]">
                <span>{voice?.eyebrow || theme.kicker}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--tk-text)] opacity-50" />
                <span className="text-[var(--tk-muted)]">{label}</span>
              </div>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className="editable-display mt-8 max-w-4xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.02em] sm:text-7xl lg:text-[6.25rem]">
                {voice?.headline || `Browse ${label}`}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className="mt-8 max-w-2xl text-lg leading-7 text-[var(--tk-muted)]">
                {voice?.description || theme.note}
              </p>
              {voice?.chips?.length ? (
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </EditableReveal>

            <EditableReveal index={3}>
              <div className="mt-14 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--tk-muted)]">
                  <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span>{' '}
                  {posts.length === 1 ? 'entry' : 'entries'} · {categoryLabel}
                </p>
                <form action={basePath} className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-text)]"
                      aria-label={voice?.filterLabel || 'Filter'}
                    >
                      <option value="all">All collections</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="editable-pill bg-[var(--tk-text)] text-[var(--tk-on-accent)]">Apply</button>
                </form>
              </div>
            </EditableReveal>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-24 sm:px-8 lg:px-10">
          {posts.length ? (
            task === 'sbm' ? (
              <BookmarkShelfLayout posts={posts} basePath={basePath} showInFeedAd={showInFeedAd} />
            ) : task === 'profile' ? (
              <ProfileIndexLayout posts={posts} basePath={basePath} />
            ) : (
              <div className={taskGrid[task]}>
                {posts.map((post, index) => (
                  <EditableReveal key={post.id || post.slug} index={index % 6}>
                    <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                  </EditableReveal>
                ))}
              </div>
            )
          ) : (
            <div className="mx-auto max-w-xl rounded-[6px] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-20 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-6 text-3xl font-medium tracking-[-0.02em]">Nothing on this shelf yet.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--tk-muted)]">
                Try another collection, or check back after new entries are added to {label.toLowerCase()}.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-20 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className="editable-pill border border-[var(--tk-text)]">
                  Previous
                </Link>
              ) : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className="editable-pill bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} index={index} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

/* ================== SBM: The Shelf Layout ==================
   Distinct from every other task. Opens with a big "featured shelf" band
   (top pick shown as a wide editorial card), then a mix of large + medium
   editorial tiles rather than a uniform grid. The in-feed ad is woven in
   as a "sponsor shelf" tile so it reads as part of the shelving. */
function BookmarkShelfLayout({ posts, basePath, showInFeedAd }: { posts: SitePost[]; basePath: string; showInFeedAd: boolean }) {
  const [featured, ...rest] = posts
  const featuredHref = `${basePath}/${featured.slug}`
  const chunks: Array<SitePost[]> = []
  for (let i = 0; i < rest.length; i += 6) chunks.push(rest.slice(i, i + 6))

  return (
    <div className="space-y-16">
      {/* Featured shelf — the pinned top pick */}
      <EditableReveal index={0}>
        <Link
          href={featuredHref}
          className="group grid gap-8 overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 lg:grid-cols-[1.15fr_1fr]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--tk-raised)] lg:aspect-auto">
            <img src={getImage(featured)} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.03]" />
            <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-text)]">
              Pinned to the shelf
            </span>
          </div>
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--tk-muted)]">
              No. 01 · {getCategory(featured, 'The Library')}
            </p>
            <h2 className="editable-display text-4xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
              {featured.title}
            </h2>
            <p className="text-base leading-7 text-[var(--tk-muted)]">{getSummary(featured)}</p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="editable-pill bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
                Open on the shelf <ArrowUpRight className="h-4 w-4" />
              </span>
              {cleanDomain(getField(featured, ['website', 'url', 'link'])) ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  <Globe className="h-3.5 w-3.5" /> {cleanDomain(getField(featured, ['website', 'url', 'link']))}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </EditableReveal>

      {chunks.map((chunk, ci) => (
        <div key={`chunk-${ci}`} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-6">
            {chunk.map((post, i) => {
              // Alternating tile sizes: first tile of each row spans wide.
              const wide = i === 0
              const globalIndex = 2 + ci * 6 + i
              return (
                <EditableReveal
                  key={post.id || post.slug}
                  index={i}
                  className={wide ? 'md:col-span-4' : 'md:col-span-2'}
                >
                  <BookmarkShelfTile post={post} href={`${basePath}/${post.slug}`} index={globalIndex - 1} wide={wide} />
                </EditableReveal>
              )
            })}
          </div>
          {showInFeedAd && ci === 0 ? (
            <EditableReveal index={0}>
              <div className="rounded-[6px] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">Sponsor shelf</p>
                <Ads slot="in-feed" size={pickRandom(getSlotSizes('in-feed'))} showLabel className="mx-auto w-full" />
              </div>
            </EditableReveal>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function BookmarkShelfTile({ post, href, index, wide }: { post: SitePost; href: string; index: number; wide: boolean }) {
  const image = getImage(post)
  const domain = cleanDomain(getField(post, ['website', 'url', 'link']))
  const category = getCategory(post, 'Shelf')
  return (
    <Link href={href} className={`group flex h-full flex-col overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 ${wide ? 'lg:flex-row' : ''}`}>
      <div className={`relative overflow-hidden bg-[var(--tk-raised)] ${wide ? 'aspect-[4/3] lg:aspect-auto lg:w-1/2' : 'aspect-[4/3]'}`}>
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center"><Globe className="h-10 w-10 text-[var(--tk-muted)]" /></div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
          {category}
        </span>
      </div>
      <div className={`flex flex-1 flex-col p-6 sm:p-7 ${wide ? 'lg:justify-center' : ''}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">
          No. {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className={`editable-display mt-3 leading-[1.02] tracking-[-0.02em] ${wide ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{post.title}</h3>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-6 flex items-center justify-between">
          {domain ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">
              <Globe className="h-3.5 w-3.5" /> {domain}
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">Open</span>
          )}
          <ArrowUpRight className="h-4 w-4 text-[var(--tk-text)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

/* ================== PROFILE: Curator Index Layout ==================
   Kept for direct-URL access; never listed in the public UI. Layout is a
   numbered curator ledger rather than a card grid — deliberately different
   from every other task, and different from the sbm archive too. */
function ProfileIndexLayout({ posts, basePath }: { posts: SitePost[]; basePath: string }) {
  return (
    <div>
      <div className="border-y border-[var(--tk-line)]">
        <div className="grid grid-cols-[60px_minmax(0,1fr)_120px] items-center gap-6 px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)] sm:grid-cols-[60px_minmax(0,1fr)_200px_120px]">
          <span>#</span>
          <span>Curator</span>
          <span className="hidden sm:block">Based in</span>
          <span className="text-right">Page</span>
        </div>
      </div>
      <ol className="divide-y divide-[var(--tk-line)]">
        {posts.map((post, index) => {
          const avatar = getImages(post)[0]
          const role = getField(post, ['role', 'designation', 'company', 'occupation'])
          const location = getField(post, ['location', 'city', 'country'])
          return (
            <EditableReveal key={post.id || post.slug} index={index % 6} as="div">
              <Link
                href={`${basePath}/${post.slug}`}
                className="group grid grid-cols-[60px_minmax(0,1fr)_120px] items-center gap-6 px-2 py-6 transition duration-500 hover:bg-[var(--tk-surface)] sm:grid-cols-[60px_minmax(0,1fr)_200px_120px]"
              >
                <span className="editable-display text-2xl font-medium tracking-[-0.02em] text-[var(--tk-muted)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex min-w-0 items-center gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                    {avatar ? (
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-6 w-6 text-[var(--tk-muted)]" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="editable-display truncate text-2xl font-medium leading-tight tracking-[-0.02em]">{post.title}</p>
                    {role ? <p className="mt-1 truncate text-sm text-[var(--tk-muted)]">{role}</p> : null}
                  </div>
                </div>
                <span className="hidden truncate text-sm text-[var(--tk-muted)] sm:inline-flex sm:items-center sm:gap-1.5">
                  {location ? (
                    <>
                      <MapPin className="h-3.5 w-3.5" /> {location}
                    </>
                  ) : (
                    '—'
                  )}
                </span>
                <span className="justify-self-end inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
                  Open <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </EditableReveal>
          )
        })}
      </ol>
    </div>
  )
}

/* ===== Premium sbm shelf card — used by generic dispatch when needed ===== */
function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const domain = cleanDomain(getField(post, ['website', 'url', 'link']))
  const category = getCategory(post, 'Shelf')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Globe className="h-10 w-10 text-[var(--tk-muted)]" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
          {category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">
          No. {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="editable-display mt-3 text-2xl font-medium leading-[1.05] tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-6 flex items-center justify-between">
          {domain ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">
              <Globe className="h-3.5 w-3.5" /> {domain}
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">Open</span>
          )}
          <ArrowUpRight className="h-4 w-4 text-[var(--tk-text)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Entry')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
      </div>
      <div className="p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">
          {category} · No. {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="editable-display mt-4 text-2xl font-medium leading-[1.05] tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
          Read entry <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  return (
    <Link href={href} className={`${cardBase} flex-row items-center gap-6 p-6`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Globe className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-2xl font-medium tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-text)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className={`${cardBase} p-7`}>
      <h2 className="editable-display text-2xl font-medium leading-[1.05] tracking-[-0.02em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
        Open notice <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-6 block break-inside-avoid overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(17,17,17,0.78))] opacity-80 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className="editable-display line-clamp-2 text-lg font-medium leading-tight tracking-[-0.02em] text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`${cardBase} p-7`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">Document · No. {String(index + 1).padStart(2, '0')}</p>
      <h2 className="editable-display mt-4 text-2xl font-medium leading-[1.05] tracking-[-0.02em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
        Open document <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  // Kept for the direct-URL detail page's data model; NEVER surfaced in the
  // public UI because /profile itself is filtered out of nav/home/search.
  const avatar = getImages(post)[0]
  return (
    <Link href={href} className={`${cardBase} items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <Globe className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-5 text-xl font-medium tracking-[-0.02em]">{post.title}</h2>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
