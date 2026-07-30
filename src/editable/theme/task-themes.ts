import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Kreon-style task surfaces. Every task (archive + detail) shares one
  editorial monochrome identity — ink black, paper white, hairline dividers,
  Anek Telugu display + Barlow Condensed body — so the site reads as one
  design system. Per-task copy (kicker / note) still varies so each surface
  has a little voice. Tokens are delivered via CSS variables (`--tk-*`).
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Anek Telugu', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const BODY_FONT = "'Barlow Condensed', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#f4f2ed',
  surface: '#ffffff',
  raised: '#e8e6e0',
  text: '#111111',
  muted: '#414141',
  line: '#dddddd',
  accent: '#111111',
  accentSoft: '#ffdede',
  onAccent: '#f4f2ed',
  glow: 'rgba(255,222,222,0.55)',
  radius: '6px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Editions', note: 'Notes, essays, and long-form pieces from the community.' },
  listing: { ...base, kicker: 'Directory', note: 'Places, studios, and businesses worth keeping close.' },
  classified: { ...base, kicker: 'Notices', note: 'Fresh listings and offers, ready to act on.' },
  image: { ...base, kicker: 'Gallery', note: 'A visual feed of standout images and sets.' },
  sbm: { ...base, kicker: 'The Library', note: 'Curated links, tools, and resources — collected by hand.' },
  pdf: { ...base, kicker: 'Documents', note: 'Downloadable guides, reports and references.' },
  profile: { ...base, kicker: 'Curator', note: 'A single curator surface — reachable by direct link only.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.sbm
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
