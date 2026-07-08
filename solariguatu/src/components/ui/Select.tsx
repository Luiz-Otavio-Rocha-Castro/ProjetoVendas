import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export default function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '0.8rem', fontWeight: 600,
          color: 'var(--color-foreground-2)',
          fontFamily: 'var(--font-body)',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          {...props}
          className={`input-base ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
          style={{
            appearance: 'none', paddingRight: '32px', cursor: 'pointer',
            ...(props.style || {}),
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: '#FFFFFF', color: '#0F1929' }}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--color-muted)',
          }}
        />
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  )
}
