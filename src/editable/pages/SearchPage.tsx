import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { toPlainText } from '@/editable/cards/PostCards'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask, taskDisplayLabel } from '@/editable/content/global.content'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => (typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : '')
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? (content.images.find((item) => typeof item === 'string') as string | undefined) : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  return toPlainText(
    (typeof post.summary === 'string' && post.summary) ||
      compactRaw(content.description) ||
      compactRaw(content.excerpt) ||
      compactRaw(content.body) ||
      '',
  )
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  // Hard filter — never surface a hidden-task post (e.g. profile) in search
  // results, no matter what the user or query asks for.
  if (derivedTask && isUiHiddenTask(String(derivedTask))) return false
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'sbm'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = task ? taskDisplayLabel(task, SITE_CONFIG.tasks.find((item) => item.key === task)?.label) : 'Entry'
  const strong = index % 5 === 0

  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-[6px] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 ${strong ? 'md:col-span-2' : ''}`}
    >
      {image ? (
        <div className={`relative overflow-hidden bg-[var(--slot4-media-bg)] ${strong ? 'aspect-[16/7]' : 'aspect-[16/10]'}`}>
          <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
            {taskLabel}
          </span>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {!image ? (
          <span className="w-fit rounded-full bg-[var(--slot4-page-text)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-on-accent)]">
            {taskLabel}
          </span>
        ) : null}
        <h2 className="editable-display mt-4 line-clamp-3 text-2xl font-medium leading-[1.05] tracking-[-0.02em]">{post.title}</h2>
        {summary ? <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const requestedTask = (resolved.task || '').trim().toLowerCase()
  // Refuse to filter by a hidden task even if the URL asks for it.
  const task = requestedTask && isUiHiddenTask(requestedTask) ? '' : requestedTask
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const publicTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && !isUiHiddenTask(item.key))
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : publicTasks.flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:py-24 sm:px-8 lg:px-10">
          <EditableReveal index={0}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
              {pagesContent.search.hero.badge}
            </p>
            <h1 className="editable-display mt-8 max-w-4xl text-5xl font-medium leading-[0.96] tracking-[-0.02em] sm:text-7xl lg:text-[6.5rem]">
              {pagesContent.search.hero.title}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-7 text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
          </EditableReveal>

          <EditableReveal index={1}>
            <form action="/search" className="mt-12 rounded-[6px] border border-[var(--editable-border)] bg-white p-5 sm:p-6">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 border-b border-[var(--slot4-page-text)] pb-3">
                <Search className="h-5 w-5" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
                />
                <button type="submit" className="editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                  Search
                </button>
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-3">
                  <Filter className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                  <input
                    name="category"
                    defaultValue={category}
                    placeholder="Collection"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
                  />
                </label>
                <select
                  name="task"
                  defaultValue={task}
                  className="rounded-full border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-semibold outline-none"
                >
                  <option value="">All content types</option>
                  {publicTasks.map((item) => (
                    <option key={item.key} value={item.key}>
                      {taskDisplayLabel(item.key, item.label)}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </EditableReveal>

          <div className="mt-16 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                {results.length} results
              </p>
              <h2 className="editable-display mt-3 text-4xl font-medium tracking-[-0.02em] sm:text-5xl">
                {query ? `Results for “${query}”` : pagesContent.search.resultsTitle}
              </h2>
            </div>
            <Link href="/sbm" className="editable-pill border border-[var(--slot4-page-text)]">
              Open the library <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {results.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <SearchResultCard key={post.id || post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[6px] border border-dashed border-[var(--editable-border)] bg-white p-14 text-center">
              <p className="editable-display text-3xl font-medium tracking-[-0.02em]">Nothing matches — yet.</p>
              <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">
                Try a different keyword, collection, or content type.
              </p>
            </div>
          )}

          <div className="mt-16">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
