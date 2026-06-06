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
        <h1 className="text-xl font-semibold text-gray-800">Сьогодні</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {pending.length === 0 && tasks.length > 0
            ? 'Все виконано! 🎉'
            : `${pending.length} залишилось · ${done.length} виконано`}
        </p>
        {tasks.length > 0 && (
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((done.length / tasks.length) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
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
          <p className="text-gray-400 text-center px-8">
            Немає задач на сьогодні. Перенеси з Inbox!
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-16">
          <span className="text-5xl">🔍</span>
          <p className="text-gray-400 text-center px-8">Немає задач за обраними фільтрами</p>
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Сьогодні'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
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
    <li className={`bg-white rounded-2xl border shadow-sm transition-opacity ${task.done ? 'opacity-50 border-gray-100' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3 p-4">
        {/* checkbox */}
        <button
          onClick={handleToggle}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            task.done
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'border-gray-300'
          } ${popped ? 'animate-check-pop' : ''}`}
          aria-label={task.done ? 'Позначити як невиконане' : 'Позначити як виконане'}
        >
          {task.done && <span className="text-xs leading-none">✓</span>}
        </button>

        {/* title + badges */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              className="w-full text-base text-gray-800 bg-gray-50 rounded-xl px-2 py-1 border border-indigo-300 focus:outline-none"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) }}
              onKeyDown={e => { if (e.key === 'Enter') { onUpdateTitle(task.id, editValue.trim() || task.title); setEditing(false) } }}
            />
          ) : (
            <span
              className={`text-base leading-snug ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}
              onClick={() => !task.done && onOpenDetail(task)}
            >
              {task.title}
            </span>
          )}
          {!task.done && (task.priority === 'must' || task.dueDate || task.duration) && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {task.priority === 'must' && (
                <span className="text-xs font-medium bg-red-50 text-red-500 px-2 py-0.5 rounded-full">🔥 Важливо</span>
              )}
              {task.dueDate && (
                <DateBadge dueDate={task.dueDate} onUpdate={date => onUpdateDueDate(task.id, date)} />
              )}
              {task.duration && (
                <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">⏱ {task.duration}</span>
              )}
            </div>
          )}
        </div>

        {/* actions */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onMoveToInbox(task.id)}
            className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 text-base flex items-center justify-center active:bg-gray-100"
            aria-label="Перенести в Inbox"
          >
            📥
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-9 h-9 rounded-xl bg-red-50 text-red-400 text-base flex items-center justify-center active:bg-red-100"
            aria-label="Видалити"
          >
            ×
          </button>
        </div>
      </div>

      {/* subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <ul className="pb-3 px-4 pl-13 space-y-1 border-t border-gray-50 pt-2">
          {task.subtasks.map(sub => (
            <li key={sub.id} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
              {sub.title}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
