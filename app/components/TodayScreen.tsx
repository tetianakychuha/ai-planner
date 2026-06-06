'use client'
import { useState } from 'react'
import { Task } from '../types'
import DateBadge from './DateBadge'
import FilterBar, { Filters, DEFAULT_FILTERS, isDefault } from './FilterBar'
import { applyFilters, collectLabels } from '../utils/filters'
import { Flame, Clock, Check, Inbox, X } from 'lucide-react'

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
    <div className="flex flex-col h-full" style={{ background: '#222631' }}>
      <div className="px-4 pt-5 pb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.95)' }}>Сьогодні</h1>
        <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.70)', marginTop: '2px' }}>
          {pending.length === 0 && tasks.length > 0
            ? 'Все виконано! 🎉'
            : `${pending.length} залишилось · ${done.length} виконано`}
        </p>
        {tasks.length > 0 && (
          <div className="mt-3">
            <div
              className="overflow-hidden"
              style={{ height: '4px', background: 'rgba(253,52,51,0.20)', borderRadius: '9999px' }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.round((done.length / tasks.length) * 100)}%`,
                  background: '#FD3433',
                  borderRadius: '9999px',
                }}
              />
            </div>
            <p className="mt-1 text-right" style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
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
          <p className="text-center px-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Немає задач на сьогодні. Перенеси з Inbox!
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-16">
          <p className="text-center px-8" style={{ color: 'rgba(255,255,255,0.45)' }}>Немає задач за обраними фільтрами</p>
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
        background: '#3B404C',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        opacity: task.done ? 0.6 : 1,
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
            border: task.done ? 'none' : '1.5px solid #616672',
            background: task.done ? '#FD3433' : 'transparent',
            color: '#FFFFFF',
          }}
          aria-label={task.done ? 'Позначити як невиконане' : 'Позначити як виконане'}
        >
          {task.done && <Check size={13} strokeWidth={2.5} color="#FFFFFF" />}
        </button>

        {/* title + badges */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              className="w-full rounded-xl px-2 py-1 focus:outline-none"
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
            <span
              className="leading-snug"
              style={{
                fontSize: '17px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: task.done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.95)',
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
                <span className="flex items-center gap-1" style={{ fontSize: '13px', fontWeight: 500, background: 'rgba(253,52,51,0.18)', color: '#FD3433', padding: '5px 10px', borderRadius: '9999px' }}>
                  <Flame size={13} strokeWidth={2} />Важливо
                </span>
              )}
              {task.dueDate && (
                <DateBadge dueDate={task.dueDate} onUpdate={date => onUpdateDueDate(task.id, date)} />
              )}
              {task.duration && (
                <span className="flex items-center gap-1" style={{ fontSize: '13px', fontWeight: 500, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.70)', padding: '5px 10px', borderRadius: '9999px' }}>
                  <Clock size={13} strokeWidth={2} />{task.duration}
                </span>
              )}
            </div>
          )}
        </div>

        {/* actions */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onMoveToInbox(task.id)}
            className="flex items-center justify-center"
            style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }}
            aria-label="Перенести в Inbox"
          >
            <Inbox size={16} strokeWidth={1.75} color="rgba(255,255,255,0.45)" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex items-center justify-center"
            style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }}
            aria-label="Видалити"
          >
            <X size={16} strokeWidth={2} color="rgba(255,255,255,0.45)" />
          </button>
        </div>
      </div>

      {/* subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <ul className="pb-3 px-4 pl-13 space-y-1 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {task.subtasks.map(sub => (
            <li key={sub.id} className="flex items-center gap-2" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.70)' }}>
              <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
              {sub.title}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
