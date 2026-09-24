import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

function Container({ children, className = '' }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  )
}

export default Container