import React from 'react'

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  highlight?: boolean
  delay?: number
}

export default function MetricCard({ label, value, sub, icon, trend, highlight = false, delay = 0 }: MetricCardProps) {
  return (
    <div
      className={`glass rounded-2xl p-5 flex flex-col gap-4 animate-slideUp relative overflow-hidden ${highlight ? 'glow-amber' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* subtle top gradient */}
      {highlight && (
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)' }}
        />
      )}

      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
          {label}
        </p>
        <div
          className="p-2 rounded-xl"
          style={{
            background: highlight ? 'var(--color-primary-subtle)' : 'var(--color-surface-2)',
            color: highlight ? 'var(--color-primary)' : 'var(--color-muted)',
            border: highlight ? '1px solid var(--color-primary-glow)' : '1px solid var(--color-border)',
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <p
          className="text-2xl font-bold leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            color: highlight ? 'var(--color-primary)' : 'var(--color-foreground)',
          }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>{sub}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-semibold"
            style={{ color: trend.positive ? 'var(--color-success)' : 'var(--color-danger)' }}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>vs mês anterior</span>
        </div>
      )}
    </div>
  )
}
