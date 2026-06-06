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
      className="relative text-xs font-medium bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full cursor-pointer active:bg-indigo-100"
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
