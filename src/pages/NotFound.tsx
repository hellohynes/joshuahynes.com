import { SiteHeader } from '../components/SiteHeader'
import { Link } from '../lib/router.tsx'

export function NotFound() {
  return (
    <div className="px-[clamp(1.5rem,6.8vw,6rem)]">
      <SiteHeader section={null} />
      <main id="main" tabIndex={-1} className="py-24">
        <h1 className="m-0 text-[clamp(1.5rem,2.2vw,1.875rem)] font-normal leading-[1.2] text-muted">
          There is nothing at this address.
        </h1>
        <p className="mt-4 text-[15px] leading-[1.2] tracking-[-0.3px]">
          <Link to="/" className="text-ink underline underline-offset-4">
            Back to the home page
          </Link>
        </p>
      </main>
    </div>
  )
}
