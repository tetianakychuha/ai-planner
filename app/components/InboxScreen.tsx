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
    <div className="flex flex-col h-full" style={{ background: '#222631' }}>
      <div className="px-4 pt-5 pb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.95)' }}>Inbox</h1>
        <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.70)', marginTop: '2px' }}>
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
    <li className="relative overflow-hidden" style={{ borderRadius: '16px' }}>
      {/* swipe reveal */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-5"
        style={{ background: '#FD3433', borderRadius: '16px' }}
      >
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
          background: '#3B404C',
          borderRadius: '16px',
          padding: '14px 16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        className="relative"
      >
        {editing ? (
          <input
            autoFocus
            className="w-full mb-2 rounded-xl px-2 py-1 focus:outline-none"
            style={{
              fontSize: '17px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.95)',
              background: '#222631',
              border: '1px solid #FD3433',
            }}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) }}
            onKeyDown={e => { if (e.key === 'Enter') { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) } }}
          />
        ) : (
          <p
            className="mb-2 leading-snug"
            style={{ fontSize: '17px', fontWeight: 500, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.95)' }}
            onClick={() => onOpenDetail(task)}
          >
            {task.title}
          </p>
        )}
        <div className="flex gap-2 flex-wrap mb-3">
          {task.priority === 'must' && (
            <span style={{ fontSize: '13px', fontWeight: 500, background: 'rgba(253,52,51,0.18)', color: '#FD3433', padding: '5px 10px', borderRadius: '9999px' }}>
              🔥 Важливо
            </span>
          )}
          {task.priority === 'nice' && (
            <span style={{ fontSize: '13px', fontWeight: 500, background: '#453C4C', color: 'rgba(255,255,255,0.70)', padding: '5px 10px', borderRadius: '9999px' }}>
              ✨ Бажано
            </span>
          )}
          {task.dueDate && (
            <DateBadge dueDate={task.dueDate} onUpdate={date => onUpdateDueDate(task.id, date)} />
          )}
          {task.duration && (
            <span style={{ fontSize: '13px', fontWeight: 500, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.70)', padding: '5px 10px', borderRadius: '9999px' }}>
              ⏱ {task.duration}
            </span>
          )}
          {(task.labels ?? []).map(l => (
            <span key={l} style={{ fontSize: '13px', fontWeight: 500, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.70)', padding: '5px 10px', borderRadius: '9999px' }}>
              #{l}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onMoveToToday(task.id)}
            className="flex-1 transition-colors"
            style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.70)', fontSize: '13px', fontWeight: 500 }}
          >
            На сьогодні
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex items-center justify-center text-lg transition-colors"
            style={{ width: '44px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.40)' }}
            aria-label="Видалити"
          >
            🗑️
          </button>
        </div>
      </div>
    </li>
  )
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-16">
      <span className="text-5xl">{emoji}</span>
      <p className="text-center px-8" style={{ color: 'rgba(255,255,255,0.45)' }}>{text}</p>
    </div>
  )
}
