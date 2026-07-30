import Link from 'next/link'
import { ArrowUpRight, Globe } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

/*
  Editorial card family for the library. Every card is quiet, ink + paper,
  with a slow image lift on hover. Exports and prop names are kept byte
  identical — only JSX / classNames / copy have changed.
*/

// The posting API repeats the same asset across `media[]`, `content.images[]`,
// `content.image`, `content.featuredImage` and `content.logo`. Any surface
// that collects several of those fields must de-duplicate, otherwise one
// picture is rendered as a gallery of identical copies.
export function dedupeUrls(urls: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      urls
        .map((url) => (typeof url === 'string' ? url.trim() : ''))
        .filter((url) => url.length > 0),
    ),
  )
}

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

// Reduce any content payload — rich HTML, entity-encoded HTML, or already-plain text — to
// a clean plain-text card summary. Card excerpts must never show raw markup regardless of
// what the content API sends. Two tag-strip passes (before + after entity decode) also catch
// entity-encoded markup like &lt;p&gt;.
export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
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
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Shelf'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

function cleanDomain(url?: string | null) {
  if (!url) return ''
  return String(url).replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '').split(/[/?#]/)[0]
}

function domainOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.website === 'string' && content.website) ||
    (typeof content.url === 'string' && content.url) ||
    (typeof content.link === 'string' && content.link) ||
    ''
  return cleanDomain(raw)
}

export function EditorialFeatureCard({ post, href, label = 'On the shelf' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group relative block min-w-0 overflow-hidden ${dc.surface.dark} ${dc.motion.lift}`}>
      <div className="relative min-h-[540px] p-8 sm:p-12 lg:min-h-[680px]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover opacity-45 ${dc.motion.imageZoom}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.05),rgba(17,17,17,0.88))]" />
        <div className="relative z-10 flex h-full min-h-[480px] flex-col justify-end lg:min-h-[600px]">
          <span className={`${dc.type.eyebrow} text-white/70`}>{label}</span>
          <h3 className="editable-display mt-6 max-w-3xl text-[2.75rem] font-medium leading-[0.95] tracking-[-0.02em] text-white sm:text-6xl lg:text-[5rem]">
            {post.title}
          </h3>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{getEditableExcerpt(post, 200)}</p>
          <span className="editable-pill mt-10 w-fit bg-white text-[var(--slot4-page-text)] hover:text-white">
            Open on the shelf <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const domain = domainOf(post)
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} ${dc.media.wide}`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover ${dc.motion.imageZoom}`}
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
          No. {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-6">
        <p className={`${dc.type.eyebrow} ${pal.mutedText}`}>{getEditableCategory(post)}</p>
        <h3 className={`editable-display mt-4 line-clamp-2 text-3xl font-medium leading-[1.02] tracking-[-0.02em] ${pal.panelText}`}>
          {post.title}
        </h3>
        <p className={`mt-3 line-clamp-2 text-[15px] leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 130)}</p>
        {domain ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
            <Globe className="h-3.5 w-3.5" /> {domain}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group flex items-start gap-5 border-b border-[var(--editable-border)] py-6 ${dc.motion.fade}`}>
      <span className="editable-display text-2xl font-medium tracking-[-0.02em] text-[var(--slot4-muted-text)] w-12 shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`${dc.type.eyebrow} ${pal.mutedText}`}>{getEditableCategory(post)}</p>
        <h3 className={`editable-display mt-2 line-clamp-2 text-2xl font-medium leading-[1.02] tracking-[-0.02em] ${pal.panelText}`}>
          {post.title}
        </h3>
        <p className={`mt-2 line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 110)}</p>
      </div>
      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[var(--slot4-muted-text)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--slot4-page-text)]" />
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const domain = domainOf(post)
  return (
    <Link
      href={href}
      className={`group grid min-w-0 gap-6 overflow-hidden ${dc.surface.card} p-5 ${dc.motion.lift} sm:grid-cols-[260px_minmax(0,1fr)]`}
    >
      <div className={`${dc.media.frame} aspect-[4/3] sm:aspect-auto sm:min-h-[220px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover ${dc.motion.imageZoom}`}
        />
      </div>
      <div className="min-w-0 p-1 sm:py-4 sm:pr-6">
        <p className={`${dc.type.eyebrow} ${pal.mutedText}`}>Entry {String(index + 1).padStart(2, '0')}</p>
        <h2 className={`editable-display mt-4 line-clamp-3 text-3xl font-medium leading-[1.02] tracking-[-0.02em] ${pal.panelText} sm:text-4xl`}>
          {post.title}
        </h2>
        <p className={`mt-4 line-clamp-3 text-base leading-7 ${pal.mutedText}`}>{getEditableExcerpt(post, 200)}</p>
        <div className="mt-6 flex items-center gap-4">
          <span className="editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
            Open link <ArrowUpRight className="h-4 w-4" />
          </span>
          {domain ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
              <Globe className="h-3.5 w-3.5" /> {domain}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
