import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  sbm: {
    eyebrow: 'The Library',
    headline: 'Every collection is a shelf, kept by hand.',
    description:
      'Curated links, tools and references — placed one at a time by contributors, and organised into open collections you can reach for.',
    filterLabel: 'Filter by collection',
    secondaryNote: 'Follow a shelf, or take a slow reading route through the whole library.',
    chips: ['Hand-kept', 'Open collections', 'Permalinkable'],
  },
  profile: {
    eyebrow: 'Curator',
    headline: 'A curator page — reachable by direct link only.',
    description:
      'This page is intentionally not listed in navigation, search, or the home surface. Share the direct link with anyone who should reach it.',
    filterLabel: 'Filter contributions',
    secondaryNote: 'Every contribution is placed on a shelf in the open library.',
    chips: ['Direct-link only', 'Not indexed in nav', 'Public URL'],
  },
  article: {
    eyebrow: 'The Notebook',
    headline: 'Notes and essays from the library.',
    description:
      'A quiet reading corner. Essays, field notes, and longer-form pieces from contributors — each one worth the sit-down.',
    filterLabel: 'Filter notebook topic',
    secondaryNote: 'Reading surfaces need space, hierarchy, and fewer distractions.',
    chips: ['Slow reading', 'Field notes', 'Contributor essays'],
  },
  classified: {
    eyebrow: 'Notices',
    headline: 'Short, time-sensitive notices from the community.',
    description:
      'A modest noticeboard for offers, calls, and time-sensitive posts — kept lean so the good ones stay on top.',
    filterLabel: 'Filter notice type',
    secondaryNote: 'Prioritise urgency, short summaries, and direct browsing.',
    chips: ['Short-form', 'Time-sensitive', 'Direct action'],
  },
  pdf: {
    eyebrow: 'Documents',
    headline: 'Downloadable references, kept alongside the shelves.',
    description:
      'Reports, guides and reference files — filed next to the collections that link to them, so the paper lives near the source.',
    filterLabel: 'Filter document type',
    secondaryNote: 'Document surfaces need archive cues, file context, and clear browsing.',
    chips: ['Reports', 'Guides', 'Archive ready'],
  },
  listing: {
    eyebrow: 'Directory',
    headline: 'Places, studios, and businesses worth keeping close.',
    description:
      'A quiet directory — small studios, independent makers, and places contributors have vouched for.',
    filterLabel: 'Filter directory category',
    secondaryNote: 'Prioritise comparison, location, and direct action paths.',
    chips: ['Small studios', 'Vouched for', 'Direct contact'],
  },
  image: {
    eyebrow: 'Gallery',
    headline: 'A visual feed of the shelves.',
    description:
      'Screenshots, cover art, and visual references from the collections — arranged as a slow gallery.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let images carry the page before long text does.',
    chips: ['Gallery', 'Visual-first', 'Slow browse'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
