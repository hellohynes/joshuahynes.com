export type Route =
  | { name: 'home' }
  | { name: 'work' }
  | { name: 'about' }
  | { name: 'piece'; kind: 'work'; id: string }
  | { name: 'notFound' }

const ID = /^[a-z0-9-]+$/

const withoutTrailingSlash = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value)

export function parseRoute(pathname: string, base: string): Route {
  const root = withoutTrailingSlash(base)
  if (pathname !== root && !pathname.startsWith(`${root}/`)) return { name: 'notFound' }

  const path = withoutTrailingSlash(pathname.slice(root.length))
  if (path === '') return { name: 'home' }
  if (path === '/work') return { name: 'work' }
  if (path === '/about') return { name: 'about' }

  const segments = path.split('/')
  if (segments.length === 3 && segments[1] === 'work' && ID.test(segments[2])) {
    return { name: 'piece', kind: 'work', id: segments[2] }
  }
  return { name: 'notFound' }
}

/** Joins an app path (`/work`, `/about#contact`) onto the Vite base so links work under `/<PR number>/`. */
export function hrefFor(path: string, base: string): string {
  return `${withoutTrailingSlash(base)}${path}`
}
