'use client'
import { useState, useRef } from 'react'
import { Task } from '../types'

const DAY_NAMES_FULL = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота']
const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getWeekDays(): Date[] {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7
  const days: (Date | null)[] = Array(startPad).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function tasksByDate(tasks: Task[], dateStr: string) {
  return tasks.filter(t => {
    const d = t.dueDate || (t.list === 'today' && t.scheduledDate)
    return d === dateStr
  })
}

export default function WeekScreen({
  tasks,
  onOpenDetail,
  onToggle,
  onMoveToDate,
}: {
  tasks: Task[]
  onOpenDetail: (task: Task) => void
  onToggle: (id: string) => void
  onMoveToDate: (id: string, date: string) => void
}) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const today = toDateStr(new Date())
  const now = new Date()
  const [monthOffset, setMonthOffset] = useState(0)
  const [draggingTask, setDraggingTask] = useState<Task | null>(null)

  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthDays = getMonthDays(targetMonth.getFullYear(), targetMonth.getMonth())
  const weekDays = getWeekDays()

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-screen)' }}>
      {/* header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {view === 'week' ? 'Тиждень' : targetMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
          </h1>
          {view === 'week' && (
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '2px' }}>
              {weekDays[0].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })} —{' '}
              {weekDays[6].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>

        {/* view toggle — segment control */}
        <div
          className="flex p-1 gap-1"
          style={{ background: 'var(--bg-card)', borderRadius: '12px' }}
        >
          <button
            onClick={() => setView('week')}
            className="px-3 py-1 transition-colors"
            style={{
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              background: view === 'week' ? 'var(--bg-screen)' : 'transparent',
              color: view === 'week' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              border: view === 'week' ? '1px solid var(--border-medium)' : '1px solid transparent',
            }}
          >
            Тиждень
          </button>
          <button
            onClick={() => setView('month')}
            className="px-3 py-1 transition-colors"
            style={{
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              background: view === 'month' ? 'var(--bg-screen)' : 'transparent',
              color: view === 'month' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              border: view === 'month' ? '1px solid var(--border-medium)' : '1px solid transparent',
            }}
          >
            Місяць
          </button>
        </div>
      </div>

      {draggingTask && (
        <div
          className="mx-4 mb-2 px-3 py-2 rounded-xl text-sm animate-fade-in"
          style={{ background: 'var(--color-accent-12)', color: '#FD3433' }}
        >
          Переміщення: <strong>{draggingTask.title}</strong> — тапни на день куди перемістити
          <button onClick={() => setDraggingTask(null)} className="ml-2 opacity-60">✕</button>
        </div>
      )}

      {view === 'week' ? (
        <WeekView
          tasks={tasks}
          days={weekDays}
          today={today}
          onOpenDetail={onOpenDetail}
          onToggle={onToggle}
          draggingTask={draggingTask}
          onStartDrag={setDraggingTask}
          onDropToDate={(dateStr) => {
            if (draggingTask) { onMoveToDate(draggingTask.id, dateStr); setDraggingTask(null) }
          }}
        />
      ) : (
        <MonthView
          tasks={tasks}
          days={monthDays}
          today={today}
          onOpenDetail={onOpenDetail}
          monthOffset={monthOffset}
          onPrev={() => setMonthOffset(o => o - 1)}
          onNext={() => setMonthOffset(o => o + 1)}
          draggingTask={draggingTask}
          onDropToDate={(dateStr) => {
            if (draggingTask) { onMoveToDate(draggingTask.id, dateStr); setDraggingTask(null) }
          }}
        />
      )}
    </div>
  )
}

function WeekView({ tasks, days, today, onOpenDetail, onToggle, draggingTask, onStartDrag, onDropToDate }: {
  tasks: Task[]
  days: Date[]
  today: string
  onOpenDetail: (t: Task) => void
  draggingTask: Task | null
  onStartDrag: (t: Task) => void
  onDropToDate: (dateStr: string) => void
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
      {days.map(day => {
        const dateStr = toDateStr(day)
        const isToday = dateStr === today
        const isPast = dateStr < today
        const dayTasks = tasksByDate(tasks, dateStr).sort((a, b) => {
          if (a.priority === 'must' && b.priority !== 'must') return -1
          if (a.priority !== 'must' && b.priority === 'must') return 1
          return 0
        })

        return (
          <div
            key={dateStr}
            onClick={() => draggingTask && onDropToDate(dateStr)}
            style={{ cursor: draggingTask ? 'pointer' : 'default' }}
          >
            <div
              className="flex items-center gap-2 mb-2 rounded-xl transition-colors"
              style={{
                padding: '4px 6px',
                background: draggingTask ? 'rgba(253,52,51,0.08)' : 'transparent',
                border: draggingTask ? '1px dashed #FD3433' : '1px solid transparent',
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '32px', height: '32px', borderRadius: '9999px',
                  background: isToday ? '#FD3433' : 'var(--border-subtle)',
                  border: isToday ? 'none' : '1px solid var(--border-subtle)',
                  color: isToday ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '14px', fontWeight: 500,
                }}
              >
                {day.getDate()}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                color: isToday ? '#FD3433' : isPast ? 'var(--text-tertiary)' : 'var(--text-primary)',
              }}>
                {DAY_NAMES_FULL[day.getDay()]}
              </span>
              {draggingTask && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#FD3433' }}>Перемістити сюди</span>
              )}
              {!draggingTask && dayTasks.length > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  {dayTasks.filter(t => t.done).length}/{dayTasks.length}
                </span>
              )}
            </div>
            {dayTasks.length === 0 ? (
              <div className="ml-10" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Немає задач</div>
            ) : (
              <ul className="ml-10 space-y-1.5">
                {dayTasks.map(task => (
                  <DraggableTaskRow
                    key={task.id}
                    task={task}
                    isDragging={draggingTask?.id === task.id}
                    onToggle={onToggle}
                    onOpenDetail={onOpenDetail}
                    onStartDrag={onStartDrag}
                  />
                ))}
              </ul>
            )}
            <div className="mt-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
          </div>
        )
      })}
    </div>
  )
}

function DraggableTaskRow({ task, isDragging, onToggle, onOpenDetail, onStartDrag }: {
  task: Task
  isDragging: boolean
  onToggle: (id: string) => void
  onOpenDetail: (t: Task) => void
  onStartDrag: (t: Task) => void
}) {
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleTouchStart() {
    longPressRef.current = setTimeout(() => onStartDrag(task), 500)
  }
  function handleTouchEnd() {
    if (longPressRef.current) clearTimeout(longPressRef.current)
  }

  return (
    <li
      className="flex items-center gap-2 transition-all no-select"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={e => e.preventDefault()}
      style={{
        background: isDragging ? 'var(--color-accent-10)' : 'var(--bg-card)',
        borderRadius: '12px',
        padding: '8px 12px',
        opacity: task.done ? 0.5 : 1,
        border: isDragging ? '1.5px solid #FD3433' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 flex items-center justify-center transition-colors"
        style={{
          width: '20px', height: '20px', borderRadius: '9999px',
          border: task.done ? 'none' : '1.5px solid #616672',
          background: task.done ? '#FD3433' : 'transparent',
          color: '#FFFFFF',
        }}
      >
        {task.done && <span style={{ fontSize: '10px', lineHeight: '1' }}>✓</span>}
      </button>
      <span
        className="flex-1"
        style={{
          fontSize: '14px',
          color: task.done ? 'var(--text-tertiary)' : isDragging ? '#FD3433' : 'var(--text-primary)',
          textDecoration: task.done ? 'line-through' : 'none',
        }}
        onClick={() => onOpenDetail(task)}
      >
        {task.title}
      </span>
      {task.priority === 'must' && !task.done && <span className="text-xs">🔥</span>}
      {task.duration && !task.done && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{task.duration}</span>}
      <span style={{ fontSize: '16px', color: 'var(--text-tertiary)', cursor: 'grab' }}>⠿</span>
    </li>
  )
}

function MonthView({ tasks, days, today, onOpenDetail, monthOffset, onPrev, onNext, draggingTask, onDropToDate }: {
  tasks: Task[]
  days: (Date | null)[]
  today: string
  onOpenDetail: (t: Task) => void
  monthOffset: number
  onPrev: () => void
  onNext: () => void
  draggingTask: Task | null
  onDropToDate: (dateStr: string) => void
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const selectedTasks = selectedDate ? tasksByDate(tasks, selectedDate) : []

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* month nav */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button
          onClick={onPrev}
          className="flex items-center justify-center text-lg"
          style={{ width: '32px', height: '32px', borderRadius: '9999px', background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          ‹
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center text-lg"
          style={{ width: '32px', height: '32px', borderRadius: '9999px', background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          ›
        </button>
      </div>

      {/* day headers */}
      <div className="grid grid-cols-7 px-2 mb-1">
        {DAY_NAMES_SHORT.map(d => (
          <div key={d} className="text-center py-1" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)' }}>{d}</div>
        ))}
      </div>

      {/* calendar grid */}
      <div className="grid grid-cols-7 px-2 gap-y-1 flex-shrink-0">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = toDateStr(day)
          const isToday = dateStr === today
          const isPast = dateStr < today
          const isSelected = dateStr === selectedDate
          const dayTasks = tasksByDate(tasks, dateStr)
          const hasMust = dayTasks.some(t => t.priority === 'must' && !t.done)
          const allDone = dayTasks.length > 0 && dayTasks.every(t => t.done)

          return (
            <button
              key={dateStr}
              onClick={() => draggingTask ? onDropToDate(dateStr) : setSelectedDate(isSelected ? null : dateStr)}
              className="flex flex-col items-center py-1.5 transition-colors"
              style={{
                borderRadius: '12px',
                background: draggingTask
                  ? 'rgba(253,52,51,0.08)'
                  : (isSelected || isToday) ? '#FD3433' : 'transparent',
                border: draggingTask ? '1px dashed #FD3433' : '1px solid transparent',
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1,
                color: (isSelected || isToday) ? '#FFFFFF' : isPast ? 'var(--text-tertiary)' : 'var(--text-primary)',
              }}>
                {day.getDate()}
              </span>
              <div className="flex gap-0.5 mt-1 h-1.5">
                {dayTasks.length > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isSelected || isToday
                        ? 'rgba(255,255,255,0.80)'
                        : hasMust
                          ? '#FD3433'
                          : allDone
                            ? 'rgba(253,52,51,0.60)'
                            : 'rgba(253,52,51,0.60)',
                    }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* selected day tasks */}
      <div className="flex-1 overflow-y-auto mt-3 px-4 pb-4">
        {selectedDate ? (
          <>
            <p className="mb-2" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {selectedTasks.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Немає задач</p>
            ) : (
              <ul className="space-y-2">
                {selectedTasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2"
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      opacity: task.done ? 0.5 : 1,
                    }}
                    onClick={() => onOpenDetail(task)}
                  >
                    <span
                      className="flex-1"
                      style={{
                        fontSize: '14px',
                        color: task.done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        textDecoration: task.done ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    {task.priority === 'must' && !task.done && <span className="text-xs">🔥</span>}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-center mt-4" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Натисни на день щоб побачити задачі</p>
        )}
      </div>
    </div>
  )
}
