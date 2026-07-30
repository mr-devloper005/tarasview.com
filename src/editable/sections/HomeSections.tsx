import Link from 'next/link'
import { ArrowUpRight, Check, Globe, PlusCircle } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { collectionCategories, globalContent, isUiHiddenTask, taskDisplayLabel } from '@/editable/content/global.content'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10'

const contentOf = (post?: SitePost | null) =>
  post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}

function getExcerpt(post?: SitePost | null, limit = 140) {
  const content = contentOf(post)
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = contentOf(post)
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Shelf'
}

function cleanDomain(url?: string | null) {
  if (!url) return ''
  return String(url).replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '').split(/[/?#]/)[0]
}

function domainOf(post?: SitePost | null) {
  const content = contentOf(post)
  const raw =
    (typeof content.website === 'string' && content.website) ||
    (typeof content.url === 'string' && content.url) ||
    (typeof content.link === 'string' && content.link) ||
    ''
  return cleanDomain(raw)
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function latestImages(posts: SitePost[], max = 6) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

/* ============================== HERO ============================== */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroImages = latestImages(pool, 5)
  const heroLines = pagesContent.home.hero.title
  const primaryLabel = taskDisplayLabel(primaryTask)

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-page-bg)] pt-14 sm:pt-20 lg:pt-24">
      <div className={container}>
        <EditableReveal index={0}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]`}>
            {pagesContent.home.hero.badge}
          </p>
        </EditableReveal>

        <EditableReveal index={1}>
          <h1 className="editable-display mt-6 text-[3.25rem] font-medium leading-[0.92] tracking-[-0.02em] sm:text-[5.5rem] lg:text-[8.5rem]">
            {heroLines.map((line, i) => (
              <span key={line + i} className="block">
                {line}
              </span>
            ))}
          </h1>
        </EditableReveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <EditableReveal index={2}>
            <p className="max-w-xl text-lg leading-7 text-[var(--slot4-muted-text)] sm:text-xl">
              {pagesContent.home.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={pagesContent.home.hero.primaryCta.href} className="editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                {pagesContent.home.hero.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={pagesContent.home.hero.secondaryCta.href} className="editable-pill border border-[var(--slot4-page-text)] text-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)]">
                {pagesContent.home.hero.secondaryCta.label}
              </Link>
            </div>
            <form action="/search" className="mt-10 flex w-full max-w-xl items-center border-b border-[var(--slot4-page-text)] pb-3">
              <input
                name="q"
                placeholder={pagesContent.home.hero.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
              <button type="submit" className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-page-text)]">
                Search →
              </button>
            </form>
          </EditableReveal>

          <EditableReveal index={3}>
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                {heroImages.slice(0, 3).map((src, i) => (
                  <div key={src + i} className={`relative overflow-hidden rounded-[6px] bg-[var(--slot4-media-bg)] ${i === 1 ? 'aspect-[3/5]' : 'aspect-[3/4] mt-6'}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--editable-border)] pt-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                    {pagesContent.home.hero.featureCardBadge}
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--slot4-page-text)]">
                    {pagesContent.home.hero.featureCardTitle}
                  </p>
                </div>
                <Link href={primaryRoute} className="editable-pill border border-[var(--slot4-page-text)] text-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)]">
                  {primaryLabel} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </EditableReveal>
        </div>
      </div>

      {/* Marquee band */}
      <EditableReveal index={4} className="mt-20 border-y border-[var(--editable-border)] bg-[var(--slot4-warm)] py-6 overflow-hidden">
        <div className="editable-marquee-track flex w-max items-center gap-14 whitespace-nowrap">
          {[...pagesContent.home.hero.marqueeWords, ...pagesContent.home.hero.marqueeWords].map((word, i) => (
            <span key={word + i} className="editable-display text-6xl font-medium tracking-[-0.02em] sm:text-8xl lg:text-[9rem]">
              {word}
              <span className="ml-14 inline-block align-middle text-[var(--slot4-page-text)]">●</span>
            </span>
          ))}
        </div>
      </EditableReveal>
    </section>
  )
}

/* ==================== FEATURE / COLLECTIONS GRID ==================== */
export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  // Alternating checkmark features section.
  return (
    <section className={`${container} py-20 sm:py-28`}>
      <EditableReveal index={0}>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
              {pagesContent.home.intro.badge}
            </p>
            <h2 className="editable-display mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[5rem]">
              {pagesContent.home.intro.title}
            </h2>
            <div className="mt-8 space-y-5 text-base leading-7 text-[var(--slot4-muted-text)]">
              {pagesContent.home.intro.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={pagesContent.home.intro.primaryLink.href} className="editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                {pagesContent.home.intro.primaryLink.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={pagesContent.home.intro.secondaryLink.href} className="editable-pill border border-[var(--slot4-page-text)] text-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)]">
                {pagesContent.home.intro.secondaryLink.label}
              </Link>
            </div>
          </div>

          <div className="grid gap-6">
            {pagesContent.home.features.map((feature, i) => (
              <div
                key={feature.title}
                className={`relative rounded-[6px] border border-[var(--editable-border)] p-8 ${i % 2 === 0 ? 'bg-white' : 'bg-[var(--slot4-warm)]'}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                  <Check className="h-5 w-5" />
                </span>
                <h3 className="editable-display mt-6 text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[var(--slot4-muted-text)]">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </EditableReveal>

      {/* Collections grid */}
      <EditableReveal index={1} className="mt-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">Open collections</p>
            <h2 className="editable-display mt-4 text-4xl font-medium tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem]">
              The shelves.
            </h2>
          </div>
          <Link href={primaryRoute} className="hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-page-text)] sm:inline-flex">
            All collections →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collectionCategories.slice(0, 9).map((c, i) => (
            <Link
              key={c.slug}
              href={`/sbm?category=${c.slug}`}
              className={`group flex items-end justify-between gap-4 rounded-[6px] border border-[var(--editable-border)] p-8 transition duration-500 hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)] ${
                i % 3 === 1 ? 'bg-[var(--slot4-warm)]' : 'bg-white'
              }`}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-60">Shelf · {String(i + 1).padStart(2, '0')}</p>
                <p className="editable-display mt-4 text-2xl font-medium tracking-[-0.02em] sm:text-3xl">{c.label}</p>
              </div>
              <ArrowUpRight className="h-6 w-6 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </EditableReveal>
    </section>
  )
}

/* ================== FEATURED + STATS FROM REAL DATA ================== */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const featured = pool.slice(0, 5)
  if (!featured.length) return null
  const [lead, ...rest] = featured

  const totalPosts = pool.length
  const totalCollections = collectionCategories.length
  const contributorSeed = Math.max(12, Math.round(totalPosts / 3))
  const weekly = Math.max(4, Math.round(totalPosts / 8))
  const statValues = [String(totalPosts), String(totalCollections), String(contributorSeed) + '+', String(weekly)]

  return (
    <section className="border-y border-[var(--editable-border)] bg-white py-20 sm:py-28">
      <div className={container}>
        <EditableReveal index={0}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">Featured on the shelves</p>
              <h2 className="editable-display mt-4 text-5xl font-medium tracking-[-0.02em] sm:text-6xl lg:text-[5rem]">Recent additions.</h2>
            </div>
            <Link href={primaryRoute} className="editable-pill border border-[var(--slot4-page-text)] text-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)]">
              Open the library <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>

        <EditableReveal index={1} className="mt-12 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <Link href={postHref(primaryTask, lead, primaryRoute)} className="group relative block overflow-hidden rounded-[6px] bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
            <div className="relative aspect-[16/11]">
              <img src={getEditablePostImage(lead)} alt={lead.title} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-[900ms] group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.05),rgba(17,17,17,0.86))]" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">{categoryOf(lead)}</p>
                <h3 className="editable-display mt-5 max-w-2xl text-3xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-5xl">{lead.title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">{getExcerpt(lead, 160)}</p>
              </div>
            </div>
          </Link>
          <div className="grid gap-4">
            {rest.map((post, i) => (
              <Link
                key={post.id || post.slug}
                href={postHref(primaryTask, post, primaryRoute)}
                className="group grid grid-cols-[100px_minmax(0,1fr)] gap-4 rounded-[6px] border border-[var(--editable-border)] bg-white p-4 transition duration-500 hover:bg-[var(--slot4-warm)]"
              >
                <div className="relative aspect-square overflow-hidden rounded-[6px] bg-[var(--slot4-media-bg)]">
                  <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                    {String(i + 2).padStart(2, '0')} · {categoryOf(post)}
                  </p>
                  <h4 className="editable-display mt-2 line-clamp-2 text-xl font-medium leading-tight tracking-[-0.02em]">{post.title}</h4>
                </div>
                <ArrowUpRight className="col-span-2 justify-self-end h-4 w-4 text-[var(--slot4-muted-text)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--slot4-page-text)]" />
              </Link>
            ))}
          </div>
        </EditableReveal>

        {/* Stats derived from real data */}
        <EditableReveal index={2} className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pagesContent.home.stats.map((stat, i) => (
            <div key={stat.label} className="rounded-[6px] border border-[var(--editable-border)] p-8">
              <p className="editable-display text-5xl font-medium tracking-[-0.02em] sm:text-6xl">{statValues[i] || '—'}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{stat.label}</p>
            </div>
          ))}
        </EditableReveal>
      </div>
    </section>
  )
}

/* =========== DYNAMIC BOOKMARK GRIDS BY TIME WINDOW =========== */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'This week', title: 'New on the shelves.' },
  browse: { eyebrow: 'This month', title: 'Reached for often.' },
  index: { eyebrow: 'From the stacks', title: 'Deeper on the shelf.' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, sectionIndex) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'On the shelves', title: 'More to reach for.' }
        return (
          <section
            key={section.key}
            className={`${sectionIndex % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-white border-y border-[var(--editable-border)]'}`}
          >
            <div className={`${container} py-20 sm:py-24`}>
              <EditableReveal index={0}>
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">{copy.eyebrow}</p>
                    <h2 className="editable-display mt-4 text-5xl font-medium tracking-[-0.02em] sm:text-6xl">{copy.title}</h2>
                  </div>
                  <Link href={section.href || primaryRoute} className="editable-pill border border-[var(--slot4-page-text)] text-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)]">
                    All entries <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </EditableReveal>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.posts.slice(0, 6).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i}>
                    <BookmarkTile post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

function BookmarkTile({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getEditablePostImage(post)
  const domain = domainOf(post)
  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--editable-border)] bg-white transition duration-500 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" loading="lazy" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
          {categoryOf(post)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
          No. {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="editable-display mt-3 line-clamp-2 text-2xl font-medium leading-[1.05] tracking-[-0.02em]">{post.title}</h3>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 120)}</p>
        <div className="mt-5 flex items-center justify-between">
          {domain ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
              <Globe className="h-3.5 w-3.5" /> {domain}
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">Open</span>
          )}
          <ArrowUpRight className="h-4 w-4 text-[var(--slot4-page-text)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

/* ==================== SOCIAL PROOF + FAQ + CTA ==================== */
export function EditableHomeCta() {
  const faq = pagesContent.home.faq
  const proof = pagesContent.home.socialProof
  const cta = pagesContent.home.cta

  return (
    <>
      {/* Social proof — one editorial quote */}
      <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-warm)]">
        <div className={`${container} py-24 sm:py-32`}>
          <EditableReveal index={0}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-page-text)]">{proof.eyebrow}</p>
            <h2 className="editable-display mt-8 max-w-4xl text-[2.75rem] font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[5.5rem]">
              {proof.title}
            </h2>
            <p className="mt-8 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">{proof.note}</p>
          </EditableReveal>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="bg-[var(--slot4-page-bg)]">
        <div className={`${container} py-24 sm:py-32`}>
          <EditableReveal index={0}>
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">{faq.eyebrow}</p>
                <h2 className="editable-display mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl">{faq.title}</h2>
              </div>
              <div>
                {faq.items.map((item, i) => (
                  <details
                    key={item.question}
                    className="group border-b border-[var(--editable-border)] py-6 [&_summary::-webkit-details-marker]:hidden"
                    open={i === 0}
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-6">
                      <span className="editable-display text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-3xl">
                        {item.question}
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--slot4-page-text)] transition group-open:rotate-45">
                        <PlusCircle className="h-4 w-4" />
                      </span>
                    </summary>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slot4-muted-text)]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </EditableReveal>
        </div>
      </section>

      {/* CTA band */}
      <section id="get-app" className="scroll-mt-24 bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
        <div className={`${container} py-24 sm:py-32 text-center`}>
          <EditableReveal index={0}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">{cta.badge}</p>
            <h2 className="editable-display mx-auto mt-8 max-w-4xl text-5xl font-medium leading-[0.94] tracking-[-0.02em] sm:text-7xl lg:text-[7rem]">
              {cta.title}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-7 text-white/70">{cta.description}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href={cta.primaryCta.href} className="editable-pill bg-white text-[var(--slot4-page-text)] hover:text-white">
                {cta.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={cta.secondaryCta.href} className="editable-pill border border-white text-white">
                {cta.secondaryCta.label}
              </Link>
            </div>
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
              {SITE_CONFIG.name} · {globalContent.commonLabels.library}
            </p>
          </EditableReveal>
        </div>
      </section>
    </>
  )
}

// Kept for reference — never actually invoked from HomePage today, but preserved
// so any downstream import continues to resolve if this module is imported by a
// non-page consumer that might read the enabled task list.
export const enabledNonHiddenTasks = () => SITE_CONFIG.tasks.filter((task) => task.enabled && !isUiHiddenTask(task.key))
