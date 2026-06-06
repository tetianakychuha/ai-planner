'use client'
import { useState } from 'react'
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
}: {
  tasks: Task[]
  onOpenDetail: (task: Task) => void
  onToggle: (id: string) => void
}) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const today = toDateStr(new Date())
  const now = new Date()
  const [monthOffset, setMonthOffset] = useState(0)

  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthDays = getMonthDays(targetMonth.getFullYear(), targetMonth.getMonth())
  const weekDays = getWeekDays()

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.3px', color: '#1C1C1E' }}>
            {view === 'week' ? 'Тиждень' : targetMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
          </h1>
          {view === 'week' && (
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#6C6C70', marginTop: '2px' }}>
              {weekDays[0].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })} —{' '}
              {weekDays[6].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>

        {/* view toggle — segment control */}
        <div
          className="flex p-1 gap-1"
          style={{ background: '#F2F2F7', borderRadius: '12px' }}
        >
          <button
            onClick={() => setView('week')}
            className="px-3 py-1 transition-colors"
            style={{
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              background: view === 'week' ? '#FFFFFF' : 'transparent',
              color: view === 'week' ? '#6B4EFF' : '#6C6C70',
              boxShadow: view === 'week' ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
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
              background: view === 'month' ? '#FFFFFF' : 'transparent',
              color: view === 'month' ? '#6B4EFF' : '#6C6C70',
              boxShadow: view === 'month' ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
            }}
          >
            Місяць
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <WeekView tasks={tasks} days={weekDays} today={today} onOpenDetail={onOpenDetail} onToggle={onToggle} />
      ) : (
        <MonthView
          tasks={tasks}
          days={monthDays}
          today={today}
          onOpenDetail={onOpenDetail}
          monthOffset={monthOffset}
          onPrev={() => setMonthOffset(o => o - 1)}
          onNext={() => setMonthOffset(o => o + 1)}
        />
      )}
    </div>
  )
}

function WeekView({ tasks, days, today, onOpenDetail, onToggle }: {
  tasks: Task[]
  days: Date[]
  today: string
  onOpenDetail: (t: Task) => void
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
          <div key={dateStr}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  background: isToday ? '#6B4EFF' : '#F2F2F7',
                  color: isToday ? '#FFFFFF' : '#6C6C70',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {day.getDate()}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: isToday ? '#6B4EFF' : isPast ? '#AEAEB2' : '#1C1C1E' }}>
                {DAY_NAMES_FULL[day.getDay()]}
              </span>
              {dayTasks.length > 0 && (
                <span style={{ fontSize: '12px', color: '#AEAEB2', marginLeft: 'auto' }}>
                  {dayTasks.filter(t => t.done).length}/{dayTasks.length}
                </span>
              )}
            </div>
            {dayTasks.length === 0 ? (
              <div className="ml-10" style={{ fontSize: '13px', color: '#AEAEB2' }}>Немає задач</div>
            ) : (
              <ul className="ml-10 space-y-1.5">
                {dayTasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                      opacity: task.done ? 0.5 : 1,
                    }}
                  >
                    <button
                      onClick={() => onToggle(task.id)}
                      className="flex-shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '9999px',
                        border: task.done ? 'none' : '2px solid rgba(60,60,67,0.12)',
                        background: task.done ? '#6B4EFF' : 'transparent',
                        color: '#FFFFFF',
                      }}
                    >
                      {task.done && <span style={{ fontSize: '10px', lineHeight: 1 }}>✓</span>}
                    </button>
                    <span
                      className="flex-1"
                      style={{
                        fontSize: '14px',
                        color: task.done ? '#AEAEB2' : '#1C1C1E',
                        textDecoration: task.done ? 'line-through' : 'none',
                      }}
                      onClick={() => onOpenDetail(task)}
                    >
                      {task.title}
                    </span>
                    {task.priority === 'must' && !task.done && <span className="text-xs">🔥</span>}
                    {task.duration && !task.done && <span style={{ fontSize: '12px', color: '#AEAEB2' }}>{task.duration}</span>}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3" style={{ borderBottom: '1px solid rgba(60,60,67,0.08)' }} />
          </div>
        )
      })}
    </div>
  )
}

function MonthView({ tasks, days, today, onOpenDetail, monthOffset, onPrev, onNext }: {
  tasks: Task[]
  days: (Date | null)[]
  today: string
  onOpenDetail: (t: Task) => void
  monthOffset: number
  onPrev: () => void
  onNext: () => void
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
          style={{ width: '32px', height: '32px', borderRadius: '9999px', background: '#F2F2F7', color: '#6C6C70' }}
        >
          ‹
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center text-lg"
          style={{ width: '32px', height: '32px', borderRadius: '9999px', background: '#F2F2F7', color: '#6C6C70' }}
        >
          ›
        </button>
      </div>

      {/* day headers */}
      <div className="grid grid-cols-7 px-2 mb-1">
        {DAY_NAMES_SHORT.map(d => (
          <div key={d} className="text-center py-1" style={{ fontSize: '12px', fontWeight: 500, color: '#AEAEB2' }}>{d}</div>
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
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className="flex flex-col items-center py-1.5 transition-colors"
              style={{
                borderRadius: '12px',
                background: isSelected ? '#6B4EFF' : isToday ? '#EDE9FF' : 'transparent',
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1,
                color: isSelected ? '#FFFFFF' : isToday ? '#6B4EFF' : isPast ? '#AEAEB2' : '#1C1C1E',
              }}>
                {day.getDate()}
              </span>
              <div className="flex gap-0.5 mt-1 h-1.5">
                {dayTasks.length > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isSelected ? '#FFFFFF' : allDone ? '#34C759' : hasMust ? '#FF3B30' : '#6B4EFF',
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
            <p className="mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#6C6C70' }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {selectedTasks.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#AEAEB2' }}>Немає задач</p>
            ) : (
              <ul className="space-y-2">
                {selectedTasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                      opacity: task.done ? 0.5 : 1,
                    }}
                    onClick={() => onOpenDetail(task)}
                  >
                    <span
                      className="flex-1"
                      style={{
                        fontSize: '14px',
                        color: task.done ? '#AEAEB2' : '#1C1C1E',
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
          <p className="text-center mt-4" style={{ fontSize: '13px', color: '#AEAEB2' }}>Натисни на день щоб побачити задачі</p>
        )}
      </div>
    </div>
  )
}
