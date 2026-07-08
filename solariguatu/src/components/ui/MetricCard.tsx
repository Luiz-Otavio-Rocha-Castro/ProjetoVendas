import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

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
      className="animate-slideUp"
      style={{
        animationDelay: `${delay}ms`,
        background: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        border: highlight
          ? '1px solid var(--color-primary-border)'
          : '1px solid var(--color-border)',
        boxShadow: highlight
          ? '0 4px 16px var(--color-primary-glow), 0 1px 3px rgba(15,25,41,0.06)'
          : '0 1px 3px rgba(15,25,41,0.06)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Top accent line for highlight cards */}
      {highlight && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #E8901A, #F5A93A)',
          borderRadius: '12px 12px 0 0',
        }} />
      )}

      {/* Label + Icon row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.07em',
          color: 'var(--color-muted)',
          margin: 0,
          fontFamily: 'var(--font-body)',
        }}>
          {label}
        </p>
        <div style={{
          padding: '8px',
          borderRadius: '9px',
          background: highlight ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
          color: highlight ? 'var(--color-primary)' : 'var(--color-muted)',
          border: highlight ? '1px solid var(--color-primary-border)' : '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <p style={{
          fontSize: '1.65rem', fontWeight: 800, lineHeight: 1,
          margin: '0 0 4px',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.025em',
          color: highlight ? 'var(--color-primary)' : 'var(--color-foreground)',
        }}>
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
            {sub}
          </p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            fontSize: '0.75rem', fontWeight: 700,
            color: trend.positive ? 'var(--color-success)' : 'var(--color-danger)',
            background: trend.positive ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            border: `1px solid ${trend.positive ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
            padding: '2px 7px', borderRadius: '99px',
          }}>
            {trend.positive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />
            }
            {trend.value}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
            vs mês anterior
          </span>
        </div>
      )}
    </div>
  )
}
