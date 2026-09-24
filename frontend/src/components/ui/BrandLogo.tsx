interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'default' | 'light'
  className?: string
}

function BrandLogo({
  size = 'md',
  showText = true,
  variant = 'default',
  className = '',
}: BrandLogoProps) {
  const sizes = {
    sm: {
      icon: 'h-8 w-8',
      text: 'text-base',
    },
    md: {
      icon: 'h-10 w-10',
      text: 'text-xl',
    },
    lg: {
      icon: 'h-16 w-16',
      text: 'text-3xl',
    },
  }

  const currentSize = sizes[size]

  const navy = variant === 'light' ? '#FFFFFF' : '#0B2545'
  const gold = '#B89758'

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
    >
      <div
        className={`flex ${currentSize.icon} shrink-0 items-center justify-center`}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden="true"
        >
          {/* Bridge */}
          <path
            d="M6 42C16 40 23 34 32 34C41 34 48 40 58 42"
            stroke={navy}
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M6 47C17 45 24 39 32 39C40 39 47 45 58 47"
            stroke={gold}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Bridge supports */}
          <path
            d="M16 40V51"
            stroke={navy}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M48 40V51"
            stroke={gold}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Open book */}
          <path
            d="M32 18V35"
            stroke={navy}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M32 19C27 16 21 16 16 18V33C21 31 27 32 32 35"
            stroke={navy}
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M32 19C37 16 43 16 48 18V33C43 31 37 32 32 35"
            stroke={gold}
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer book pages */}
          <path
            d="M16 21C12 21 9 23 7 25V35C10 33 13 32 16 32"
            stroke={navy}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M48 21C52 21 55 23 57 25V35C54 33 51 32 48 32"
            stroke={gold}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-serif tracking-[-0.02em] ${currentSize.text} ${
            variant === 'light'
              ? 'text-white'
              : 'text-[var(--color-brand-navy)]'
          }`}
        >
          <span className="font-semibold">Context</span>{' '}
          <span
            className={
              variant === 'light'
                ? 'font-normal text-white/90'
                : 'font-normal text-[var(--color-brand-navy-light)]'
            }
          >
            Bridge
          </span>
        </span>
      )}
    </div>
  )
}

export default BrandLogo