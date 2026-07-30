'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, UserPlus, LogIn, X, PlusCircle } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Kreon-style masthead. Intentionally does NOT surface any task/route links:
  the library and its collections live in the footer and the home page.
  Only About, Contact, a search icon (→ /search), and auth actions appear.
*/
export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const navLinks = globalContent.nav.primaryLinks
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-md">
      <nav className="mx-auto flex min-h-[80px] w-full max-w-[var(--editable-container)] items-center gap-8 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain invert" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="editable-display block max-w-[240px] truncate text-2xl font-semibold leading-none tracking-[-0.02em]">
              {SITE_CONFIG.name}
            </span>
            <span className="mt-1 block max-w-[240px] truncate text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
              {globalContent.nav.tagline}
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition ${
                isActive(item.href) ? 'text-[var(--slot4-page-text)]' : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
              }`}
            >
              {item.label}
              {isActive(item.href) ? (
                <span className="absolute inset-x-3 bottom-1 h-[2px] bg-[var(--slot4-page-text)]" />
              ) : null}
            </Link>
          ))}

          <Link
            href={globalContent.nav.searchHref}
            aria-label="Search the library"
            className={`ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] transition hover:border-[var(--slot4-page-text)] ${
              isActive(globalContent.nav.searchHref) ? 'bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]' : 'text-[var(--slot4-page-text)]'
            }`}
          >
            <Search className="h-4 w-4" />
          </Link>

          <span className="mx-3 hidden h-6 w-px bg-[var(--editable-border)] lg:inline-block" />

          {session ? (
            <>
              <Link href="/create" className="editable-pill hidden bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)] lg:inline-flex">
                <PlusCircle className="h-3.5 w-3.5" /> Contribute
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] lg:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] lg:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
              <Link href="/signup" className="editable-pill hidden bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)] lg:inline-flex">
                <UserPlus className="h-3.5 w-3.5" /> Library card
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-5 py-6 md:hidden">
          <div className="grid gap-1">
            {[{ label: 'Home', href: '/' }, ...navLinks, { label: 'Search', href: globalContent.nav.searchHref }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-l-2 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
                  isActive(item.href)
                    ? 'border-[var(--slot4-page-text)] bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]'
                    : 'border-transparent text-[var(--slot4-muted-text)] hover:border-[var(--slot4-page-text)]/40 hover:bg-[var(--slot4-panel-bg)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-wrap gap-2">
              {session ? (
                <>
                  <Link href="/create" onClick={() => setOpen(false)} className="editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                    <PlusCircle className="h-3.5 w-3.5" /> Contribute
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                    className="editable-pill border border-[var(--slot4-page-text)]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="editable-pill border border-[var(--slot4-page-text)]">
                    <LogIn className="h-3.5 w-3.5" /> Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="editable-pill bg-[var(--slot4-page-text)] text-[var(--slot4-on-accent)]">
                    <UserPlus className="h-3.5 w-3.5" /> Library card
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
