/** A hairline robot. On hover the antenna lights up and the eyes glance to the side. */
export function Robot() {
  return (
    <span className="group mx-[0.2em] inline-block h-[1.05em] align-[-0.16em]">
      <svg
        viewBox="0 0 28 30"
        aria-hidden="true"
        className="h-full w-auto fill-none stroke-current"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* antenna */}
        <path d="M14 7V3.6" />
        <circle
          cx="14"
          cy="2.4"
          r="1.3"
          className="motion-safe:transition-[fill] motion-safe:duration-300 group-hover:fill-accent group-hover:stroke-accent"
        />
        {/* head, ears, mouth */}
        <rect x="5" y="7" width="18" height="14" rx="3.4" />
        <path d="M2.4 11.5v5.2M25.6 11.5v5.2" />
        <path d="M10 17.6h8" />
        {/* eyes */}
        <g className="motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-[1.1px]">
          <circle cx="10.4" cy="13" r="1.7" />
          <circle cx="17.6" cy="13" r="1.7" />
        </g>
        {/* neck and shoulders */}
        <path d="M11.5 21v2.4M16.5 21v2.4" />
        <path d="M6 28.2v-2.6a2.2 2.2 0 0 1 2.2-2.2h11.6a2.2 2.2 0 0 1 2.2 2.2v2.6" />
      </svg>
    </span>
  )
}
