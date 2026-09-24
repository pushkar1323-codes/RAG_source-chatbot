import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50'

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',

    secondary:
      'border border-[var(--color-border-soft)] bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface)]',

    ghost:
      'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button