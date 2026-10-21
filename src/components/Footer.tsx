const link = 'text-ink underline-offset-2 hover:underline'

export function Footer({ email }: { email: string }) {
  return (
    <footer className="pb-6 pt-16">
      <p className="m-0 text-[15px] leading-[1.2] tracking-[-0.3px] text-muted">
        Write to me at{' '}
        <a href={`mailto:${email}`} className={link}>
          {email}
        </a>
        .
      </p>
    </footer>
  )
}
