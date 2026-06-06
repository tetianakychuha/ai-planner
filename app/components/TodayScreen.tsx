'use client'
import { useState } from 'react'
import { Task } from '../types'
import DateBadge from './DateBadge'
import FilterBar, { Filters, DEFAULT_FILTERS, isDefault } from './FilterBar'
import { applyFilters, collectLabels } from '../utils/filters'

export default function TodayScreen({
  tasks,
  onToggle,
  onMoveToInbox,
  onDelete,
  onUpdateTitle,
  onUpdateDueDate,
  onOpenDetail,
}: {
  tasks: Task[]
  onToggle: (id: string) => void
  onMoveToInbox: (id: string) => void
  onDelete: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
  onUpdateDueDate: (id: string, date: string | undefined) => void
  onOpenDetail: (task: Task) => void
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const done = tasks.filter(t => t.done)
  const pending = tasks.filter(t => !t.done).sort((a, b) => {
    if (a.priority === 'must' && b.priority !== 'must') return -1
    if (a.priority !== 'must' && b.priority === 'must') return 1
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    return 0
  })

  const allSorted = [...pending, ...done]
  const filtered = applyFilters(allSorted, filters)
  const allLabels = collectLabels(tasks)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.3px', color: '#1C1C1E' }}>Сьогодні</h1>
        <p style={{ fontSize: '13px', fontWeight: 400, color: '#6C6C70', marginTop: '2px' }}>
          {pending.length === 0 && tasks.length > 0
            ? 'Все виконано! 🎉'
            : `${pending.length} залишилось · ${done.length} виконано`}
        </p>
        {tasks.length > 0 && (
          <div className="mt-3">
            <div
              className="overflow-hidden"
              style={{ height: '4px', background: '#E5E5EA', borderRadius: '9999px' }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.round((done.length / tasks.length) * 100)}%`,
                  background: '#6B4EFF',
                  borderRadius: '9999px',
                }}
              />
            </div>
            <p className="mt-1 text-right" style={{ fontSize: '13px', color: '#AEAEB2' }}>
              {Math.round((done.length / tasks.length) * 100)}%
            </p>
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <FilterBar filters={filters} onChange={setFilters} availableLabels={allLabels} />
      )}

      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-16">
          <span className="text-5xl">☀️</span>
          <p className="text-center px-8" style={{ color: '#AEAEB2' }}>
            Немає задач на сьогодні. Перенеси з Inbox!
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-16">
          <span className="text-5xl">🔍</span>
          <p className="text-center px-8" style={{ color: '#AEAEB2' }}>Немає задач за обраними фільтрами</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {filtered.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onMoveToInbox={onMoveToInbox}
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

function TaskRow({
  task,
  onToggle,
  onMoveToInbox,
  onDelete,
  onUpdateTitle,
  onUpdateDueDate,
  onOpenDetail,
}: {
  task: Task
  onToggle: (id: string) => void
  onMoveToInbox: (id: string) => void
  onDelete: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
  onUpdateDueDate: (id: string, date: string | undefined) => void
  onOpenDetail: (task: Task) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const [popped, setPopped] = useState(false)

  function handleToggle() {
    onToggle(task.id)
    if (!task.done) {
      setPopped(true)
      setTimeout(() => setPopped(false), 300)
    }
  }

  return (
    <li
      className="transition-opacity"
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        opacity: task.done ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* checkbox */}
        <button
          onClick={handleToggle}
          className={`mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${popped ? 'animate-check-pop' : ''}`}
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '9999px',
            border: task.done ? 'none' : '2px solid rgba(60,60,67,0.12)',
            background: task.done ? '#6B4EFF' : 'transparent',
            color: '#FFFFFF',
          }}
          aria-label={task.done ? 'Позначити як невиконане' : 'Позначити як виконане'}
        >
          {task.done && <span className="text-xs leading-none">✓</span>}
        </button>

        {/* title + badges */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              className="w-full rounded-xl px-2 py-1 focus:outline-none"
              style={{ fontSize: '17px', fontWeight: 500, color: '#1C1C1E', background: '#F2F2F7', border: '1px solid #6B4EFF' }}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) }}
              onKeyDown={e => { if (e.key === 'Enter') { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) } }}
            />
          ) : (
            <span
              className="leading-snug"
              style={{
                fontSize: '17px',
                fontWeight: 500,
                letterSpacing: '-0.2px',
                color: task.done ? '#AEAEB2' : '#1C1C1E',
                textDecoration: task.done ? 'line-through' : 'none',
                display: 'block',
              }}
              onClick={() => !task.done && onOpenDetail(task)}
            >
              {task.title}
            </span>
          )}
          {!task.done && (task.priority === 'must' || task.dueDate || task.duration) && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {task.priority === 'must' && (
                <span style={{ fontSize: '13px', fontWeight: 500, background: '#FFF1F0', color: '#FF3B30', padding: '5px 10px', borderRadius: '9999px' }}>
                  🔥 Важливо
                </span>
              )}
              {task.dueDate && (
                <DateBadge dueDate={task.dueDate} onUpdate={date => onUpdateDueDate(task.id, date)} />
              )}
              {task.duration && (
                <span style={{ fontSize: '13px', fontWeight: 500, background: '#F2F2F7', color: '#6C6C70', padding: '5px 10px', borderRadius: '9999px' }}>
                  ⏱ {task.duration}
                </span>
              )}
            </div>
          )}
        </div>

        {/* actions */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onMoveToInbox(task.id)}
            className="flex items-center justify-center text-base"
            style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#F2F2F7', color: '#AEAEB2' }}
            aria-label="Перенести в Inbox"
          >
            📥
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex items-center justify-center text-base"
            style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#FFF1F0', color: '#FF3B30' }}
            aria-label="Видалити"
          >
            ×
          </button>
        </div>
      </div>

      {/* subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <ul className="pb-3 px-4 pl-13 space-y-1 pt-2" style={{ borderTop: '1px solid rgba(60,60,67,0.08)' }}>
          {task.subtasks.map(sub => (
            <li key={sub.id} className="flex items-center gap-2" style={{ fontSize: '13px', color: '#6C6C70' }}>
              <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ border: '1px solid rgba(60,60,67,0.12)' }} />
              {sub.title}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
