import type { CSSProperties } from 'react'

/*
  Kreon-style editorial monochrome. Ink black + paper white, generous
  typography (Anek Telugu display + Barlow Condensed body), tight tracking,
  pill buttons with an animated second layer, one soft-pink neon band, one
  blue link accent. Everything else is monochrome. Every home / task
  section reads these variables.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#f4f2ed',
  '--slot4-page-text': '#111111',
  '--slot4-panel-bg': '#ffffff',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#414141',
  '--slot4-soft-muted-text': '#999999',
  '--slot4-accent': '#111111',
  '--slot4-accent-fill': '#111111',
  '--slot4-accent-soft': '#ffdede',
  '--slot4-on-accent': '#f4f2ed',
  '--slot4-dark-bg': '#111111',
  '--slot4-dark-text': '#f4f2ed',
  '--slot4-media-bg': '#e8e6e0',
  '--slot4-cream': '#f4f2ed',
  '--slot4-warm': '#ffdede',
  '--slot4-lavender': '#ffffff',
  '--slot4-gray': '#e8e6e0',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#f4f2ed',
  '--editable-page-text': '#111111',
  '--editable-container': '1500px',
  '--editable-border': '#dddddd',
  '--editable-nav-bg': '#f4f2ed',
  '--editable-nav-text': '#111111',
  '--editable-nav-active': '#111111',
  '--editable-nav-active-text': '#f4f2ed',
  '--editable-cta-bg': '#111111',
  '--editable-cta-text': '#f4f2ed',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#111111',
  '--editable-footer-text': '#f4f2ed',
  '--editable-link-blue': '#3898ec',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/12',
  shadow: 'shadow-[0_1px_0_rgba(17,17,17,0.05)]',
  shadowStrong: 'shadow-[0_18px_50px_rgba(17,17,17,0.10)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(17,17,17,0.02),rgba(17,17,17,0.72))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10',
    sectionY: 'py-20 sm:py-24 lg:py-28',
    sectionYSmall: 'py-10 sm:py-14',
    sectionYExtra: 'py-24 sm:py-32 lg:py-40',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[340px]',
  },
  type: {
    eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-page-text)]',
    heroTitle:
      'editable-display text-[3.25rem] font-medium leading-[0.94] tracking-[-0.02em] sm:text-[4.5rem] lg:text-[6.5rem]',
    sectionTitle:
      'editable-display text-4xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem]',
    display:
      'editable-display text-6xl font-medium leading-[0.88] tracking-[-0.02em] sm:text-8xl lg:text-[11rem]',
    body: 'text-[1.05rem] leading-[1.55] tracking-[0.005em]',
  },
  surface: {
    card: `rounded-[6px] border ${editablePalette.border} ${editablePalette.surfaceBg}`,
    soft: `rounded-[6px] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[6px] ${editablePalette.darkBg} ${editablePalette.darkText}`,
    quiet: 'rounded-[6px] bg-transparent',
  },
  button: {
    primary: `editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)] hover:text-[var(--slot4-on-accent)]`,
    secondary: `editable-pill border border-[var(--slot4-page-text)] text-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)]`,
    inverse: `editable-pill bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)] hover:text-[var(--slot4-page-text)]`,
    ghost: `editable-pill text-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)]`,
  },
  media: {
    frame: `relative overflow-hidden rounded-[6px] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/5]',
    wide: 'aspect-[16/9]',
    square: 'aspect-square',
  },
  motion: {
    lift: 'transition duration-[600ms] hover:-translate-y-1',
    fade: 'transition duration-500 hover:opacity-80',
    imageZoom: 'transition duration-[900ms] group-hover:scale-[1.035]',
  },
} as const

export const aiLayoutRules = [
  'Change palette in editableRootStyle first; every section consumes those CSS variables.',
  'Keep page structure in HomeSections.tsx so AI can redesign the entire home experience in one file.',
  'Use giant editorial type — the reference is display-scale, not SaaS-scale.',
  'Wrap section groups in <EditableReveal /> for the fade-and-slide reveal.',
  'Use postHref() for all post links so per-task routes keep working.',
  'Never hardcode the brand name — read from SITE_CONFIG.name.',
  'Never expose profile in any public UI — filter via isUiHiddenTask().',
] as const
