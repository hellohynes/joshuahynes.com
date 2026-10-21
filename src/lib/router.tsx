/* oxlint-disable react/only-export-components -- the router API (useRoute, navigate, Link) lives in one module by design */
import { useSyncExternalStore } from 'react'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { hrefFor, parseRoute } from './route.ts'
import type { Route } from './route.ts'

const BASE = import.meta.env.BASE_URL
const NAVIGATE_EVENT = 'app:navigate'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATE_EVENT, onChange)
  }
}

const getPathname = () => location.pathname

export function useRoute(): Route {
  return parseRoute(useSyncExternalStore(subscribe, getPathname), BASE)
}

function hashId(path: string): string {
  const hash = path.split('#')[1] ?? ''
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

export function navigate(path: string): void {
  history.pushState(null, '', hrefFor(path, BASE))
  window.dispatchEvent(new Event(NAVIGATE_EVENT))

  // Wait for React to commit the new route before looking for the hash target.
  const id = hashId(path)
  requestAnimationFrame(() => {
    const target = id ? document.getElementById(id) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  })
}

type LinkProps = { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>

export function Link({ to, onClick, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      rest.target === '_blank'
    ) {
      return
    }
    event.preventDefault()
    navigate(to)
  }
  return <a {...rest} href={hrefFor(to, BASE)} onClick={handleClick} />
}
