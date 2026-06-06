'use client'
import { useRef } from 'react'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Сьогодні'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

export default function DateBadge({
  dueDate,
  onUpdate,
}: {
  dueDate: string
  onUpdate: (date: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <span
      className="relative cursor-pointer"
      style={{
        fontSize: '13px',
        fontWeight: 500,
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.70)',
        padding: '5px 10px',
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
      onClick={() => inputRef.current?.showPicker()}
    >
      📅 {formatDate(dueDate)}
      <input
        ref={inputRef}
        type="date"
        value={dueDate}
        onChange={e => e.target.value && onUpdate(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        tabIndex={-1}
      />
    </span>
  )
}
