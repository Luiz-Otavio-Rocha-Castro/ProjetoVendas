import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  disabled,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-primary)',
      color: '#0a0a0a',
    },
    secondary: {
      background: 'var(--color-surface-2)',
      color: 'var(--color-foreground)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-muted)',
    },
    danger: {
      background: 'oklch(0.65 0.22 25 / 0.15)',
      color: 'var(--color-danger)',
      border: '1px solid oklch(0.65 0.22 25 / 0.25)',
    },
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        opacity: disabled || loading ? 0.55 : 1,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : leftIcon}
      {children}
    </button>
  )
}
