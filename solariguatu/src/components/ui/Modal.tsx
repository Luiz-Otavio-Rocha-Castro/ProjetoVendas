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
      style={{ background: 'oklch(0.05 0.02 250 / 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass-strong rounded-2xl shadow-2xl animate-scaleIn flex flex-col w-full"
        style={{ maxWidth: width, maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
