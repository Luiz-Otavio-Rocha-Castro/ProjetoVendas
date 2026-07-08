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
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-200 cursor-pointer select-none'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #E8901A 0%, #D07D10 100%)',
      color: '#FFFFFF',
      boxShadow: '0 3px 12px rgba(232,144,26,0.30)',
      border: 'none',
    },
    secondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-foreground)',
      border: '1.5px solid var(--color-border)',
      boxShadow: '0 1px 3px rgba(15,25,41,0.06)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-muted)',
      border: 'none',
    },
    danger: {
      background: 'var(--color-danger-bg)',
      color: 'var(--color-danger)',
      border: '1.5px solid var(--color-danger-border)',
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
