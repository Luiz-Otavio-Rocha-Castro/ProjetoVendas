import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export default function Input({ label, error, leftIcon, className = '', style, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center"
            style={{ color: 'var(--color-muted)', zIndex: 1 }}
          >
            {leftIcon}
          </div>
        )}
        <input
          {...props}
          className={`input-base ${leftIcon ? 'pl-9' : ''} ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
          style={{ ...(leftIcon ? { paddingLeft: '2.25rem' } : {}), ...style }}
        />
      </div>
      {error && (
        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</span>
      )}
    </div>
  )
}
