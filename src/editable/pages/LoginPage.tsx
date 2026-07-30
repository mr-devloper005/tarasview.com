import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/login',
    title: 'Sign in',
    description: pagesContent.auth.login.metadataDescription,
  })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-14 px-5 py-20 sm:py-28 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <EditableReveal index={0}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
              {pagesContent.auth.login.badge}
            </p>
            <h1 className="editable-display mt-8 max-w-xl text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[5.5rem]">
              {pagesContent.auth.login.title}
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-7 text-[var(--slot4-muted-text)]">
              {pagesContent.auth.login.description}
            </p>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="rounded-[6px] border border-[var(--editable-border)] bg-white p-8 sm:p-10">
              <h2 className="editable-display text-3xl font-medium tracking-[-0.02em]">{pagesContent.auth.login.formTitle}</h2>
              <EditableLocalLoginForm />
              <p className="mt-8 text-sm text-[var(--slot4-muted-text)]">
                New here?{' '}
                <Link href="/signup" className="font-semibold text-[var(--slot4-page-text)] underline underline-offset-4 hover:no-underline">
                  {pagesContent.auth.login.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
