import Link from 'next/link'

interface LogoProps {
  href?: string | null
  className?: string
}

export default function Logo({ href, className = 'inline-block group' }: LogoProps) {
  const image = (
    <img
      src="/Mental Health Addis Logo.svg"
      alt="Mental Health Addis"
      className="h-10 w-auto md:h-12"
    />
  )

  // If href is explicitly null or undefined, render without link
  if (href === null) {
    return <div className={className}>{image}</div>
  }

  // Default to home page if href is not provided
  const linkHref = href || '/'

  return (
    <Link href={linkHref} className={className}>
      {image}
    </Link>
  )
}

