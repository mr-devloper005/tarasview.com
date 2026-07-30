'use client'

import { Bookmark, Mail, MessageSquare, Sparkles } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

const lanes = [
  {
    icon: Bookmark,
    title: 'Suggest a link or a collection',
    body: 'Point us at a tool you keep re-opening, or a shelf that ought to exist.',
  },
  {
    icon: MessageSquare,
    title: 'Flag a broken link',
    body: 'Something on the shelves stopped resolving? Tell us where and we will fix it.',
  },
  {
    icon: Sparkles,
    title: 'Say hello',
    body: 'Notes, questions, quiet corrections. Every message is read by a person.',
  },
  {
    icon: Mail,
    title: 'Press & partnerships',
    body: 'For interviews, features, or curator collaborations, drop us a line.',
  },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-28 sm:px-8 lg:px-10">
          <EditableReveal index={0}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
              {pagesContent.contact.eyebrow}
            </p>
            <h1 className="editable-display mt-8 max-w-5xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.02em] sm:text-7xl lg:text-[7rem]">
              {pagesContent.contact.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.contact.description}</p>
          </EditableReveal>

          <div className="mt-16 grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <EditableReveal index={1}>
              <div className="grid gap-4">
                {lanes.map((lane, i) => (
                  <div
                    key={lane.title}
                    className={`rounded-[6px] border border-[var(--editable-border)] p-7 ${i % 2 === 0 ? 'bg-white' : 'bg-[var(--slot4-warm)]'}`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                      <lane.icon className="h-5 w-5" />
                    </span>
                    <h2 className="editable-display mt-5 text-2xl font-medium leading-tight tracking-[-0.02em]">{lane.title}</h2>
                    <p className="mt-3 text-base leading-7 text-[var(--slot4-muted-text)]">{lane.body}</p>
                  </div>
                ))}
              </div>
            </EditableReveal>

            <EditableReveal index={2}>
              <div className="rounded-[6px] border border-[var(--editable-border)] bg-white p-8 sm:p-10">
                <h2 className="editable-display text-3xl font-medium tracking-[-0.02em]">{pagesContent.contact.formTitle}</h2>
                <EditableContactLeadForm />
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
