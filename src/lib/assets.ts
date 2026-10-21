/** Resolve a root-absolute asset path (`/work/a.jpg`) against the Vite base; other URLs pass through unchanged. */
export function assetUrl(src: string, base: string): string {
  if (!src.startsWith('/') || src.startsWith('//')) return src
  return base.replace(/\/$/, '') + src
}
