'use client'

import { createElement, useEffect, useState, type CSSProperties, type ReactNode } from 'react'

type EditableRevealProps = {
  children: ReactNode
  /** Stagger position — later children reveal a little after earlier ones. */
  index?: number
  className?: string
  /** Trigger when this fraction of the element is in view. */
  threshold?: number
  /** Extra margin around the root when checking visibility. */
  rootMargin?: string
  /** Element tag — most callers want a div (default) or a section. */
  as?: 'div' | 'section' | 'article' | 'header' | 'footer'
}

/**
 * Fades + slides its children into view on scroll. Hidden state is applied
 * only *after mount* (via `data-ready="true"`), so SSR HTML stays fully
 * visible for crawlers and users with JS disabled. Respects reduced motion
 * (see editable-global.css). Uses `--ease-premium` for the transition.
 */
export function EditableReveal({
  children,
  index = 0,
  className = '',
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  as = 'div',
}: EditableRevealProps) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setReady(true)
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, threshold, rootMargin])

  const style = { '--reveal-index': String(index) } as CSSProperties

  return createElement(
    as,
    {
      ref: setNode,
      className: `editable-reveal ${className}`.trim(),
      style,
      'data-ready': ready ? 'true' : 'false',
      'data-visible': visible ? 'true' : 'false',
    },
    children,
  )
}
