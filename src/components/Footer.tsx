import type { Content } from '../content'

const link = 'text-ink underline-offset-2 hover:underline'

export function Footer({ social }: { social: Content['social'] }) {
  return (
    <footer className="pb-6 pt-16">
      <p className="m-0 text-[15px] leading-[1.2] tracking-[-0.3px] text-muted">
        I’m on{' '}
        <a href={social.x} className={link} target="_blank" rel="noreferrer">
          X
        </a>{' '}
        and{' '}
        <a href={social.github} className={link} target="_blank" rel="noreferrer">
          Github
        </a>
        .
      </p>
    </footer>
  )
}
