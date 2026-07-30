import { slot4BrandConfig } from '@/editable/theme/brand.config'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'

/*
  One source of truth for which task keys should stay OUT of every public UI
  surface (nav, footer, home, search filter/results, create picker, stats).
  The task code paths themselves stay wired up — the archive/detail routes
  keep working when reached by a direct URL — but nothing in the visible UI
  should ever surface, link to, or count them.
*/
export const uiHiddenTaskKeys = ['profile'] as const

export const isUiHiddenTask = (key: string) =>
  (uiHiddenTaskKeys as readonly string[]).includes(key)

/*
  Public labels for tasks. `sbm` is renamed to "The Library" everywhere the
  user sees it, without touching task keys or routes upstream in site-config.
  This helper is the single knob — every navbar/footer/home/search/create
  surface that shows a task label routes through it.
*/
const taskLabelOverrides: Partial<Record<TaskKey, string>> = {
  sbm: 'The Library',
}

export function taskDisplayLabel(key: TaskKey, fallback?: string): string {
  return (
    taskLabelOverrides[key] ||
    fallback ||
    SITE_CONFIG.tasks.find((t) => t.key === key)?.label ||
    String(key)
  )
}

// One source of truth for the shelves shown on the home page and in the
// footer: the same list of categories that powers the /sbm archive filter,
// so a link in either surface lands the user on the exact same shelf.
export const collectionCategories = CATEGORY_OPTIONS.map((option) => ({
  label: option.name,
  slug: option.slug,
}))

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'A hand-kept library of the internet.',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'A hand-kept library.',
    // Public nav intentionally omits task links — the library and its
    // collections live in the footer and on the home page.
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    searchHref: '/search',
    actions: {
      primary: { label: 'Open the library', href: '/sbm' },
      secondary: { label: 'Contact', href: '/contact' },
    },
  },
  footer: {
    tagline: 'Curated links, tools and references.',
    description:
      'A slow, hand-kept library of the internet — links, tools, and references collected by the community, and organised into open collections.',
    columns: [
      {
        title: 'Site',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Search', href: '/search' },
        ],
      },
    ],
    collections: {
      title: 'Collections',
      // Footer keeps a compact slice — the full set is one click away.
      items: collectionCategories.slice(0, 8).map((c) => ({
        label: c.label,
        href: `/sbm?category=${c.slug}`,
      })),
      viewAll: { label: 'All collections', href: '/sbm' },
    },
    bottomNote: 'Made for the quiet corners of the web.',
  },
  commonLabels: {
    readMore: 'Open link',
    viewAll: 'View all',
    explore: 'Open the library',
    latest: 'Latest',
    related: 'From this collection',
    published: 'Added',
    library: 'The Library',
    curator: 'Curator',
  },
} as const
