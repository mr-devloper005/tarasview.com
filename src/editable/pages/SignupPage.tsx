import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/signup',
    title: 'Get a library card',
    description: pagesContent.auth.signup.metadataDescription,
  })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-14 px-5 py-20 sm:py-28 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <EditableReveal index={0}>
            <div className="rounded-[6px] border border-[var(--editable-border)] bg-white p-8 sm:p-10">
              <h1 className="editable-display text-3xl font-medium tracking-[-0.02em]">{pagesContent.auth.signup.formTitle}</h1>
              <EditableLocalSignupForm />
              <p className="mt-8 text-sm text-[var(--slot4-muted-text)]">
                Already a member?{' '}
                <Link href="/login" className="font-semibold text-[var(--slot4-page-text)] underline underline-offset-4 hover:no-underline">
                  {pagesContent.auth.signup.loginCta}
                </Link>
              </p>
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
              {pagesContent.auth.signup.badge}
            </p>
            <h2 className="editable-display mt-8 max-w-xl text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[5.5rem]">
              {pagesContent.auth.signup.title}
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-7 text-[var(--slot4-muted-text)]">
              {pagesContent.auth.signup.description}
            </p>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
