'use client'
import { useState, useRef } from 'react'
import { Task } from '../types'
import DateBadge from './DateBadge'
import FilterBar, { Filters, DEFAULT_FILTERS, isDefault } from './FilterBar'
import { applyFilters, collectLabels } from '../utils/filters'

export default function InboxScreen({
  tasks,
  onMoveToToday,
  onDelete,
  onUpdateTitle,
  onUpdateDueDate,
  onOpenDetail,
}: {
  tasks: Task[]
  onMoveToToday: (id: string) => void
  onDelete: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
  onUpdateDueDate: (id: string, date: string | undefined) => void
  onOpenDetail: (task: Task) => void
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const sorted = [...tasks].sort((a, b) => {
    if (a.priority === 'must' && b.priority !== 'must') return -1
    if (a.priority !== 'must' && b.priority === 'must') return 1
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    return 0
  })

  const filtered = applyFilters(sorted, filters)
  const allLabels = collectLabels(tasks)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-gray-800">Inbox</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {tasks.length === 0 ? 'Порожньо — чудово!' : isDefault(filters) ? `${tasks.length} задач` : `${filtered.length} з ${tasks.length}`}
        </p>
      </div>

      {tasks.length > 0 && (
        <FilterBar filters={filters} onChange={setFilters} availableLabels={allLabels} />
      )}

      {tasks.length === 0 ? (
        <EmptyState emoji="📭" text="Немає нових задач. Додай через Capture!" />
      ) : filtered.length === 0 ? (
        <EmptyState emoji="🔍" text="Немає задач за обраними фільтрами" />
      ) : (
        <ul className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {filtered.map(task => (
            <SwipeableCard
              key={task.id}
              task={task}
              onMoveToToday={onMoveToToday}
              onDelete={onDelete}
              onUpdateTitle={onUpdateTitle}
              onUpdateDueDate={onUpdateDueDate}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function SwipeableCard({
  task,
  onMoveToToday,
  onDelete,
  onUpdateTitle,
  onUpdateDueDate,
  onOpenDetail,
}: {
  task: Task
  onMoveToToday: (id: string) => void
  onDelete: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
  onUpdateDueDate: (id: string, date: string | undefined) => void
  onOpenDetail: (task: Task) => void
}) {
  const [offsetX, setOffsetX] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const startX = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setOffsetX(Math.max(dx, -100))
  }

  function onTouchEnd() {
    if (offsetX < -60) {
      setDeleting(true)
      setTimeout(() => onDelete(task.id), 250)
    } else {
      setOffsetX(0)
    }
    startX.current = null
  }

  return (
    <li className="relative overflow-hidden rounded-2xl">
      {/* red background behind card */}
      <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-5">
        <span className="text-white text-xl">🗑️</span>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${deleting ? -100 : offsetX}px)`,
          transition: offsetX === 0 || deleting ? 'transform 0.25s ease' : 'none',
          opacity: deleting ? 0 : 1,
        }}
        className="relative bg-white border border-gray-100 shadow-sm p-4 rounded-2xl"
      >
        {editing ? (
          <input
            autoFocus
            className="w-full text-base text-gray-800 mb-2 leading-snug bg-gray-50 rounded-xl px-2 py-1 border border-indigo-300 focus:outline-none"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) }}
            onKeyDown={e => { if (e.key === 'Enter') { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) } }}
          />
        ) : (
          <p
            className="text-base text-gray-800 mb-2 leading-snug"
            onClick={() => onOpenDetail(task)}
          >
            {task.title}
          </p>
        )}
        <div className="flex gap-2 flex-wrap mb-3">
          {task.priority === 'must' && (
            <span className="text-xs font-medium bg-red-50 text-red-500 px-2 py-0.5 rounded-full">🔥 Важливо</span>
          )}
          {task.dueDate && (
            <DateBadge dueDate={task.dueDate} onUpdate={date => onUpdateDueDate(task.id, date)} />
          )}
          {task.duration && (
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">⏱ {task.duration}</span>
          )}
          {(task.labels ?? []).map(l => (
            <span key={l} className="text-xs font-medium bg-purple-50 text-purple-500 px-2 py-0.5 rounded-full">#{l}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onMoveToToday(task.id)}
            className="flex-1 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium active:bg-indigo-100 transition-colors"
          >
            ☀️ На сьогодні
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-11 h-10 rounded-xl bg-red-50 text-red-500 text-lg flex items-center justify-center active:bg-red-100 transition-colors"
            aria-label="Видалити"
          >
            🗑️
          </button>
        </div>
      </div>
    </li>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Сьогодні'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-16">
      <span className="text-5xl">{emoji}</span>
      <p className="text-gray-400 text-center px-8">{text}</p>
    </div>
  )
}
