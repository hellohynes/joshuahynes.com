/** A terminal window that turns into a browser window on hover. */
export function TerminalBrowser() {
  return (
    <span className="group mx-[0.2em] inline-block h-[0.95em] align-[-0.12em]">
      <svg
        viewBox="0 0 40 28"
        aria-hidden="true"
        className="h-full w-auto fill-none stroke-current"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="1" width="38" height="26" rx="3" />
        <path d="M1 7.5h38" />
        <circle cx="5.5" cy="4.2" r="0.9" />
        <circle cx="9.3" cy="4.2" r="0.9" />
        <circle cx="13.1" cy="4.2" r="0.9" />

        {/* terminal: a prompt, a cursor, and a line of output */}
        <g className="motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-0">
          <path d="M6 12.5l3.2 2.7L6 17.9" />
          <path d="M11.5 18h6" />
          <path d="M6 22.3h15" strokeOpacity={0.5} />
        </g>

        {/* browser: an address bar and a page */}
        <g className="opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100">
          <rect x="17" y="2.6" width="19" height="3.6" rx="1.8" />
          <rect x="5.5" y="11.5" width="14" height="11" rx="1" />
          <path d="M23 12.5h11M23 16.5h11M23 20.5h7" />
        </g>
      </svg>
    </span>
  )
}
