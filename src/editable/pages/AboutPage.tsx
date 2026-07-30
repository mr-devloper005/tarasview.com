import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:py-28 sm:px-8 lg:px-10">
          <EditableReveal index={0}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
              {pagesContent.about.badge}
            </p>
            <h1 className="editable-display mt-8 max-w-5xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.02em] sm:text-7xl lg:text-[7.5rem]">
              {pagesContent.about.title}
            </h1>
          </EditableReveal>

          <div className="mt-16 grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <EditableReveal index={1}>
              <p className="max-w-2xl text-xl leading-8 text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
              <div className="mt-10 space-y-6 text-lg leading-8 text-[var(--slot4-muted-text)]">
                {pagesContent.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                Kept by the {SITE_CONFIG.name} community.
              </p>
            </EditableReveal>

            <EditableReveal index={2}>
              <div className="grid gap-4">
                {pagesContent.about.values.map((value, i) => (
                  <div
                    key={value.title}
                    className={`rounded-[6px] border border-[var(--editable-border)] p-8 ${i % 2 === 0 ? 'bg-white' : 'bg-[var(--slot4-warm)]'}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                      Principle · {String(i + 1).padStart(2, '0')}
                    </p>
                    <h2 className="editable-display mt-5 text-3xl font-medium leading-tight tracking-[-0.02em]">{value.title}</h2>
                    <p className="mt-4 text-base leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                ))}
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
