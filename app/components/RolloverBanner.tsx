'use client'

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
        background: 'rgba(253,52,51,0.12)',
        border: '1px solid rgba(253,52,51,0.25)',
        borderRadius: '16px',
      }}
    >
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.95)' }}>
        {count === 1
          ? '1 невиконана задача з вчора'
          : `${count} невиконані задачі з вчора`}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRollover}
          className="flex-1 py-2 transition-colors"
          style={{ borderRadius: '12px', background: '#FD3433', color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}
        >
          Перенести на сьогодні
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 transition-colors"
          style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.70)', fontSize: '14px', fontWeight: 500 }}
        >
          Відхилити
        </button>
      </div>
    </div>
  )
}
