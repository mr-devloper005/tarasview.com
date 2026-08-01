import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowUpRight,
  Bookmark,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask, taskDisplayLabel } from '@/editable/content/global.content'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return dedupeUrls([...media, ...images, ...singleImages]).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')
const linkifyMarkdown = (value: string) =>
  value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_m, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)
const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_m, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)
const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_m, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })
const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'),
  )
const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const comparable = (value: string) => stripHtml(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  if (!lead) return ''
  const leadKey = comparable(lead)
  return leadKey && comparable(getBody(post)).includes(leadKey) ? '' : lead
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const cleanDomain = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').split(/[/?#]/)[0]
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}
const initialsFrom = (name?: string) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((piece) => piece[0]?.toUpperCase() || '')
    .join('') || '·'

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--tk-text)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-text)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

/* ========================= SBM DETAIL (rebuilt) ========================= */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const domain = website ? cleanDomain(website) : ''
  const collection = categoryOf(post, 'The Library')
  const facts = pagesContent.detailPages.sbm.facts
  const trust = pagesContent.detailPages.sbm.trustPanel
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 6) : []
  const bodyText = stripHtml(getBody(post))
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0
  const readMinutes = Math.max(1, Math.round(wordCount / 220))

  return (
    <>
      {/* Premium hero band — no image, no date */}
      <header className="border-b border-[var(--tk-line)] bg-[var(--tk-surface)]">
        <div className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-28 sm:px-8 lg:px-10">
          <EditableReveal index={0}>
            <Kicker task="sbm">{collection}</Kicker>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className="editable-display mt-8 max-w-5xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.02em] sm:text-7xl lg:text-[6.5rem]">
              {post.title}
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {domain ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
                  <Globe2 className="h-3.5 w-3.5" /> {domain}
                </span>
              ) : null}
              {website ? (
                <Link href={website} target="_blank" rel="nofollow noopener noreferrer" className="editable-pill bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
                  {pagesContent.detailPages.sbm.visitButton} <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </EditableReveal>
        </div>
      </header>

      {/* Quick-facts strip */}
      <div className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
        <div className="mx-auto grid max-w-[var(--editable-container)] grid-cols-1 divide-[var(--tk-line)] px-5 sm:grid-cols-4 sm:divide-x sm:px-8 lg:px-10">
          <FactCell label={facts.collection} value={collection} />
          <FactCell label={facts.domain} value={domain || '—'} />
          <FactCell label={facts.verified} value="Human-added" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
          <FactCell label="Reading time" value={`${readMinutes} min · ${wordCount} words`} />
        </div>
      </div>

      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-24 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            <EditableReveal index={0}>
              <h2 className="editable-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">On this shelf</h2>
              {leadText(post) ? <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
              <BodyContent post={post} />
              {tags.length ? (
                <div className="mt-10 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/sbm?category=${encodeURIComponent(String(tag).toLowerCase())}`}
                      className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)] transition hover:border-[var(--tk-text)] hover:text-[var(--tk-text)]"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </EditableReveal>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Sticky visit CTA. The title lives in the hero only — this card
                carries the destination and the button, never a second h1. */}
            {website || domain ? (
              <EditableReveal index={0}>
                <div className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">
                    <Bookmark className="h-6 w-6" />
                  </div>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">The resource</p>
                  {domain ? (
                    <p className="editable-display mt-3 break-words text-2xl font-medium leading-tight tracking-[-0.02em]">{domain}</p>
                  ) : null}
                  {website ? (
                    <Link href={website} target="_blank" rel="nofollow noopener noreferrer" className="editable-pill mt-6 w-full justify-center bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
                      {pagesContent.detailPages.sbm.visitButton} <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </EditableReveal>
            ) : null}

            <EditableReveal index={1}>
              <div className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">{trust.title}</p>
                <p className="mt-4 text-sm leading-6 text-[var(--tk-muted)]">{trust.note}</p>
                <ul className="mt-5 space-y-3">
                  {trust.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-text)]" /> {point}
                    </li>
                  ))}
                </ul>
              </div>
            </EditableReveal>

            <EditableReveal index={2}>
              <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel className="mx-auto w-full" />
            </EditableReveal>
          </aside>
        </div>
      </section>

      {/* Companion links — horizontal rail, feels different from the "More" grid below */}
      {related.length ? (
        <section className="border-t border-[var(--tk-line)] bg-[var(--tk-surface)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-8 lg:px-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">Companion links</p>
                <h2 className="editable-display mt-4 text-3xl font-medium tracking-[-0.02em] sm:text-4xl">Other tabs to open next.</h2>
              </div>
            </div>
            <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {related.map((item) => {
                const href = `${getTaskConfig('sbm')?.route || '/sbm'}/${item.slug}`
                const itemDomain = cleanDomain(
                  getField(item, ['website', 'url', 'link']),
                )
                return (
                  <Link
                    key={item.id || item.slug}
                    href={href}
                    className="group flex w-[300px] shrink-0 snap-start flex-col gap-4 rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-bg)] p-6 transition duration-500 hover:-translate-y-1"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">
                      <Bookmark className="h-5 w-5" />
                    </span>
                    <h3 className="editable-display line-clamp-3 text-xl font-medium leading-tight tracking-[-0.02em]">{item.title}</h3>
                    {itemDomain ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                        <Globe2 className="h-3.5 w-3.5" /> {itemDomain}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="border-t border-[var(--tk-line)] bg-[var(--tk-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 lg:px-10">
            <div className="flex items-end justify-between">
              <h2 className="editable-display text-4xl font-medium tracking-[-0.02em] sm:text-5xl">
                {pagesContent.detailPages.sbm.relatedTitle}
              </h2>
              <Link href={getTaskConfig('sbm')?.route || '/sbm'} className="editable-pill border border-[var(--tk-text)]">
                All entries <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <RelatedCard key={item.id || item.slug} task="sbm" post={item} grid />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

function StatCell({ metric, label }: { metric: string; label: string }) {
  return (
    <div className="flex flex-col gap-3 px-6 py-8 sm:px-10 sm:py-10">
      <span className="editable-display text-5xl font-medium leading-none tracking-[-0.02em] sm:text-6xl lg:text-7xl">{metric}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">{label}</span>
    </div>
  )
}

function FactCell({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-6 py-6 sm:px-10">
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">{label}</span>
      <span className="inline-flex items-center gap-2 text-base font-medium text-[var(--tk-text)] sm:text-lg">
        {icon} {value}
      </span>
    </div>
  )
}

/* ======================== PROFILE DETAIL (rebuilt) ======================== */
// Never surfaced in the public UI — only reachable by direct URL. New layout
// is deliberately distinct from sbm (cover band + overlapping avatar) but uses
// the same design vocabulary so both feel like one system.
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const avatar = images[0]
  const cover = images[1] || images[0]
  const role = getField(post, ['role', 'designation', 'company', 'occupation'])
  const location = getField(post, ['location', 'city', 'country'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const bio = leadText(post) || 'A curator page — direct link only.'
  const contributions = related // curator's own content — never a "more profiles" strip
  const hidden = isUiHiddenTask('profile')
  const contributionsCount = contributions.length
  const collectionsSet = new Set<string>()
  contributions.forEach((item) => {
    const cat = asText(getContent(item).category) || item.tags?.[0]
    if (cat) collectionsSet.add(String(cat))
  })
  const collectionsCount = collectionsSet.size
  const memberSince = 'Member of the library'

  return (
    <>
      {/* Identity hero — cover band + overlapping portrait */}
      <header className="relative border-b border-[var(--tk-line)]">
        <div className="relative h-56 w-full overflow-hidden bg-[var(--tk-accent-soft)] sm:h-72 lg:h-96">
          {cover ? (
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_20%,var(--tk-glow),transparent_70%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(17,17,17,0.35))]" />
        </div>

        <div className="mx-auto max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10">
          <div className="relative -mt-16 flex flex-col gap-6 pb-10 sm:-mt-20 sm:flex-row sm:items-end lg:-mt-24">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border-4 border-[var(--tk-bg)] bg-[var(--tk-surface)] shadow-[0_18px_50px_rgba(17,17,17,0.15)] sm:h-40 sm:w-40 lg:h-48 lg:w-48">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="editable-display text-5xl font-medium text-[var(--tk-text)] sm:text-6xl lg:text-7xl">{initialsFrom(post.title)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <Kicker task="profile">{hidden ? 'Direct link only' : 'Public curator'}</Kicker>
              <h1 className="editable-display mt-4 text-4xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[4.5rem]">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--tk-muted)]">
                {role ? <span className="font-medium text-[var(--tk-text)]">{role}</span> : null}
                {location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats ledger — 3 large numbers, distinct from every other page */}
      <div className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
        <div className="mx-auto grid max-w-[var(--editable-container)] grid-cols-1 divide-[var(--tk-line)] px-5 sm:grid-cols-3 sm:divide-x sm:px-8 lg:px-10">
          <StatCell metric={String(contributionsCount).padStart(2, '0')} label="Contributions on the shelves" />
          <StatCell metric={String(collectionsCount).padStart(2, '0')} label="Collections curated" />
          <StatCell metric="✓" label={memberSince} />
        </div>
      </div>

      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-24 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <EditableReveal index={0}>
              <h2 className="editable-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">About</h2>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--tk-muted)]">{bio}</p>
              <BodyContent post={post} />
            </EditableReveal>

          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <EditableReveal index={0}>
              <div className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">Identity</p>
                <div className="mt-5 space-y-4">
                  {role ? <IdentityRow label="Role" value={role} icon={<UserRound className="h-4 w-4" />} /> : null}
                  {location ? <IdentityRow label="Based in" value={location} icon={<MapPin className="h-4 w-4" />} /> : null}
                  {website ? (
                    <IdentityRow
                      label="Website"
                      value={<span>{cleanDomain(website)}</span>}
                      icon={<Globe2 className="h-4 w-4" />}
                    />
                  ) : null}
                  {email ? (
                    <IdentityRow label="Email" value={<a href={`mailto:${email}`} className="underline underline-offset-4 hover:no-underline">{email}</a>} icon={<Mail className="h-4 w-4" />} />
                  ) : null}
                  {phone ? (
                    <IdentityRow label="Phone" value={<a href={`tel:${phone}`} className="underline underline-offset-4 hover:no-underline">{phone}</a>} icon={<Phone className="h-4 w-4" />} />
                  ) : null}
                </div>
                {website ? (
                  <Link href={website} target="_blank" rel="nofollow noopener noreferrer" className="editable-pill mt-6 w-full justify-center bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
                    {pagesContent.detailPages.profile.visitButton} <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </EditableReveal>
          </aside>
        </div>
      </section>
    </>
  )
}

function IdentityRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">{label}</p>
        <p className="mt-1 truncate text-sm font-medium text-[var(--tk-text)]">{value}</p>
      </div>
    </div>
  )
}

/* ========================= REMAINING DETAILS ========================= */
function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-5 py-20 sm:py-24 sm:px-8">
        <Kicker task="article">{categoryOf(post, 'Entry')}</Kicker>
        <h1 className="editable-display mt-6 text-balance text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[4.5rem]">
          {post.title}
        </h1>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[6px] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-24 sm:px-8 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <Kicker task="listing">Directory entry</Kicker>
              <h1 className="editable-display mt-4 text-4xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
            </div>
          </div>
          {leadText(post) ? <p className="mt-7 max-w-2xl text-lg leading-7 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
          <RelatedPanel task="listing" related={related} />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-20 sm:py-24 sm:px-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
            <Kicker task="classified">Notice</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-medium leading-tight tracking-[-0.02em]">{post.title}</h1>
            {price ? <p className="editable-display mt-6 text-4xl font-medium tracking-[-0.02em]">{price}</p> : null}
            {location ? <p className="mt-4 text-sm text-[var(--tk-muted)]">{location}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? (
                <a href={`tel:${phone}`} className="editable-pill bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
                  <Phone className="h-4 w-4" /> Call
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="editable-pill border border-[var(--tk-text)]">
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Notice images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-24 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">
              <Camera className="h-3.5 w-3.5" /> Gallery
            </div>
            <h1 className="editable-display mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-7 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-24 sm:px-8 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[6px] bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">
              <FileText className="h-9 w-9" />
            </div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold uppercase tracking-[0.22em]">Preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="editable-pill bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
                  Download <Download className="h-4 w-4" />
                </Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] min-h-[520px] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <RelatedPanel task="pdf" related={related} />
        </aside>
      </div>
    </section>
  )
}

/* ============================ SHARED BLOCKS ============================ */
function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--tk-muted)]">
            <Icon className="h-4 w-4 text-[var(--tk-text)]" /> {label}
          </div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[6px] border border-[var(--tk-line)] object-cover" />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold uppercase tracking-[0.22em]">
        <MapPin className="h-4 w-4 text-[var(--tk-text)]" /> {label || 'Map location'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className="editable-pill bg-[var(--tk-text)] text-[var(--tk-on-accent)]">
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className="editable-pill border border-[var(--tk-text)]">
          <Phone className="h-4 w-4" /> Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="editable-pill border border-[var(--tk-text)]">
          <Mail className="h-4 w-4" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-muted)]">About this entry</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2">
            <Tag className="h-4 w-4 text-[var(--tk-text)]" /> {taskDisplayLabel(task, taskConfig?.label)}
          </p>
          <p className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--tk-text)]" /> {SITE_CONFIG.name}
          </p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-medium tracking-[-0.02em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-text)]">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => (
              <RelatedCard key={item.id || item.slug} task={task} post={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-24 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-4xl font-medium tracking-[-0.02em] sm:text-5xl">
            More {(taskDisplayLabel(task, taskConfig?.label) || 'entries').toLowerCase()}
          </h2>
          <Link href={taskConfig?.route || '/'} className="editable-pill border border-[var(--tk-text)]">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <RelatedCard key={item.id || item.slug} task={task} post={item} grid />
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[6px] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText className="h-7 w-7 text-[var(--tk-muted)]" />
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="editable-display line-clamp-2 text-lg font-medium leading-tight tracking-[-0.02em]">{post.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-[6px] border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-text)]">
      {image && task !== 'sbm' ? (
        <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[6px] object-cover" />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[6px] bg-[var(--tk-raised)]">
          <FileText className="h-5 w-5 text-[var(--tk-muted)]" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
