import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export default function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`input-base appearance-none pr-8 ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: '#1a1f2e', color: '#f0f0f5' }}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-muted)' }}
        />
      </div>
      {error && <span className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  )
}
