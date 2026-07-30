'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent, isUiHiddenTask } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const columns = globalContent.footer.columns
  const collections = globalContent.footer.collections

  return (
    <footer className="border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[var(--editable-footer-text)]">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
              </span>
              <span className="editable-display text-3xl font-semibold tracking-[-0.02em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-6 max-w-md text-base leading-7 text-white/70">{globalContent.footer.description}</p>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.28em] text-white/50">{globalContent.footer.tagline}</p>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">{collections.title}</h3>
            <div className="mt-5 grid gap-3">
              {collections.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 text-base font-medium text-white/80 transition hover:text-white"
                >
                  {item.label} <ArrowUpRight className="h-4 w-4 opacity-60" />
                </Link>
              ))}
              <Link
                href={collections.viewAll.href}
                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60 hover:text-white"
              >
                {collections.viewAll.label} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div>
            {columns.map((column) => (
              <div key={column.title} className="mb-8 last:mb-0">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">{column.title}</h3>
                <div className="mt-5 grid gap-3">
                  {column.links
                    .filter((link) => !isUiHiddenTask(link.href.replace(/^\//, '').split(/[/?]/)[0]))
                    .map((link) => (
                      <Link key={link.href} href={link.href} className="text-base font-medium text-white/80 transition hover:text-white">
                        {link.label}
                      </Link>
                    ))}
                  {session ? (
                    <>
                      <Link href="/create" className="text-base font-medium text-white/80 transition hover:text-white">
                        Contribute a link
                      </Link>
                      <button type="button" onClick={logout} className="text-left text-base font-medium text-white/80 transition hover:text-white">
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-base font-medium text-white/80 transition hover:text-white">
                        Sign in
                      </Link>
                      <Link href="/signup" className="text-base font-medium text-white/80 transition hover:text-white">
                        Library card
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs font-medium uppercase tracking-[0.24em] text-white/50 sm:flex-row sm:items-center">
          <span>© {year} {SITE_CONFIG.name}</span>
          <span>{globalContent.footer.bottomNote}</span>
        </div>
      </div>
    </footer>
  )
}
