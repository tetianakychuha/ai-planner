'use client'
import { ArrowRight, X } from 'lucide-react'

type Props = {
  count: number
  onRollover: () => void
  onDismiss: () => void
}

export default function RolloverBanner({ count, onRollover, onDismiss }: Props) {
  return (
    <div
      className="mx-4 mt-4 p-4 flex flex-col gap-3"
      style={{
        background: 'var(--color-accent-12)',
        border: '1px solid var(--color-accent-25)',
        borderRadius: '16px',
      }}
    >
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
        {count === 1
          ? '1 невиконана задача з вчора'
          : `${count} невиконані задачі з вчора`}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRollover}
          className="flex-1 py-2 transition-colors flex items-center justify-center gap-1.5"
          style={{ borderRadius: '12px', background: '#FD3433', color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}
        >
          <ArrowRight size={15} strokeWidth={2} />Перенести на сьогодні
        </button>
        <button
          onClick={onDismiss}
          className="flex items-center justify-center transition-colors"
          style={{ width: '40px', borderRadius: '12px', background: 'var(--border-subtle)' }}
        >
          <X size={16} strokeWidth={2} color="var(--text-secondary)" />
        </button>
      </div>
    </div>
  )
}
