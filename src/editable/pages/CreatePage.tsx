'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Bookmark, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask, taskDisplayLabel } from '@/editable/content/global.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: Bookmark,
}

const fieldClass =
  'w-full rounded-[6px] border border-[var(--editable-border)] bg-white px-4 py-3 text-base font-medium outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-page-text)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  // Only expose contributable tasks that aren't hidden from the public UI
  // (e.g. profile is functional but never listed here).
  const contributableTasks = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !isUiHiddenTask(task.key)),
    [],
  )
  const [task, setTask] = useState<TaskKey>((contributableTasks[0]?.key || 'sbm') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = contributableTasks.find((item) => item.key === task) || contributableTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className="mx-auto grid max-w-[var(--editable-container)] gap-14 px-5 py-20 sm:py-28 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
            <EditableReveal index={0}>
              <div className="flex h-full min-h-72 items-center justify-center rounded-[6px] bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                <Lock className="h-20 w-20 opacity-80" />
              </div>
            </EditableReveal>
            <EditableReveal index={1}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
                {pagesContent.create.locked.badge}
              </p>
              <h1 className="editable-display mt-8 text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[5.5rem]">
                {pagesContent.create.locked.title}
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-7 text-[var(--slot4-muted-text)]">
                {pagesContent.create.locked.description}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/login" className="editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                  Sign in <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/signup" className="editable-pill border border-[var(--slot4-page-text)]">
                  Get a library card
                </Link>
              </div>
            </EditableReveal>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-28 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <EditableReveal index={0}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
                {pagesContent.create.hero.badge}
              </p>
              <h1 className="editable-display mt-8 text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[5.5rem]">
                {pagesContent.create.hero.title}
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-7 text-[var(--slot4-muted-text)]">
                {pagesContent.create.hero.description}
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {contributableTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`rounded-[6px] border p-5 text-left transition duration-500 ${
                        active
                          ? 'border-[var(--slot4-page-text)] bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]'
                          : 'border-[var(--editable-border)] bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="editable-display mt-4 block text-xl font-medium tracking-[-0.02em]">
                        {taskDisplayLabel(item.key, item.label)}
                      </span>
                      <span className="mt-2 block text-sm opacity-75">{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <form onSubmit={submit} className="rounded-[6px] border border-[var(--editable-border)] bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                      Add to {taskDisplayLabel(task, activeTask?.label)}
                    </p>
                    <h2 className="editable-display mt-2 text-3xl font-medium tracking-[-0.02em]">
                      {pagesContent.create.formTitle}
                    </h2>
                  </div>
                  <span className="rounded-full border border-[var(--editable-border)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em]">
                    {session.name}
                  </span>
                </div>

                <div className="mt-8 grid gap-4">
                  <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Link title" required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Collection or shelf" />
                    <input className={fieldClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link URL" />
                  </div>
                  <input className={fieldClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="Cover image URL (optional)" />
                  <textarea
                    className={`${fieldClass} min-h-24`}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Short note — why this belongs on the shelf"
                    required
                  />
                  <textarea
                    className={`${fieldClass} min-h-48`}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Longer notes, quotes, or context (optional)"
                  />
                </div>

                {created ? (
                  <div className="mt-6 rounded-[6px] border border-[var(--editable-border)] bg-[var(--slot4-warm)] p-5">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em]">
                      <CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}
                    </p>
                    <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">{created.title}</p>
                  </div>
                ) : null}

                <button type="submit" className="editable-pill mt-8 w-full justify-center bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </button>
              </form>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
