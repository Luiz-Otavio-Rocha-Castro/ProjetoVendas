import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToast, type ToastItem } from '../../contexts/ToastContext'

const ICONS = {
  success: <CheckCircle2 size={18} />,
  error:   <XCircle size={18} />,
  info:    <Info size={18} />,
}

const COLORS = {
  success: { icon: 'oklch(0.72 0.17 145)', bar: 'oklch(0.72 0.17 145)' },
  error:   { icon: 'oklch(0.65 0.22 25)',  bar: 'oklch(0.65 0.22 25)'  },
  info:    { icon: 'oklch(0.72 0.15 220)', bar: 'oklch(0.72 0.15 220)' },
}

function ToastCard({ t }: { t: ToastItem }) {
  const { dismiss } = useToast()
  const col = COLORS[t.type]

  return (
    <div
      className={`toast toast-${t.type} ${t.exiting ? 'animate-slideOutRight' : 'animate-slideInRight'}`}
    >
      {/* Icon */}
      <span style={{ color: col.icon, marginTop: '1px', flexShrink: 0 }}>
        {ICONS[t.type]}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}
        >
          {t.title}
        </p>
        {t.message && (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            {t.message}
          </p>
        )}
      </div>

      {/* Close */}
        <button
          onClick={() => dismiss(t.id)}
          className="shrink-0 p-1 rounded-lg transition-colors"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <X size={13} />
        </button>

      {/* Progress bar */}
      <div
        className="toast-progress"
        style={{ background: col.bar }}
      />
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToast()

  return createPortal(
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastCard key={t.id} t={t} />
      ))}
    </div>,
    document.body
  )
}
