import { forwardRef } from 'react'
import clsx from 'clsx'

const Button = forwardRef(({ children, size = 'default', className, ...props }, ref) => (
  <button
    ref={ref}
    className={clsx(
      'font-display font-semibold rounded-full transition-transform duration-140',
      'bg-gradient-to-br from-blue to-cyan text-white',
      'shadow-[var(--shadow-sm),0_12px_32px_rgba(34,116,228,.18)]',
      'hover:scale-[1.03] active:scale-[1.01]',
      size === 'lg' ? 'text-base px-8 py-4 shadow-[var(--shadow-lg)]' : 'text-sm px-[22px] py-[11px]',
      className
    )}
    {...props}
  >
    {children}
  </button>
))

Button.displayName = 'Button'
export default Button
