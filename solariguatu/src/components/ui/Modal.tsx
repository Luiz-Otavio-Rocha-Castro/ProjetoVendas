import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: string
}

export default function Modal({ open, onClose, title, subtitle, children, width = '560px' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(15,25,41,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="animate-scaleIn flex flex-col w-full"
        style={{
          maxWidth: width,
          maxHeight: '90vh',
          background: 'var(--color-surface)',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 60px rgba(15,25,41,0.16), 0 4px 16px rgba(15,25,41,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          background: 'var(--color-background)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo small */}
            <img src="/logo.jpg" alt="SolarIguatu" style={{ height: '28px', objectFit: 'contain' }} />
            <div>
              <h2 style={{
                fontSize: '0.975rem', fontWeight: 700, margin: 0,
                fontFamily: 'var(--font-display)', color: 'var(--color-foreground)',
                letterSpacing: '-0.01em',
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-danger-border)'
                ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)'
                ; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-danger-bg)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
                ; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'
                ; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface)'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '22px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
