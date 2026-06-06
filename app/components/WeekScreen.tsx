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
          <h1 className="text-xl font-semibold text-gray-800">
            {view === 'week' ? 'Тиждень' : targetMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
          </h1>
          {view === 'week' && (
            <p className="text-sm text-gray-400 mt-0.5">
              {weekDays[0].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })} —{' '}
              {weekDays[6].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>

        {/* view toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${view === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Тиждень
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${view === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {day.getDate()}
              </div>
              <span className={`text-sm font-medium ${isToday ? 'text-indigo-600' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
                {DAY_NAMES_FULL[day.getDay()]}
              </span>
              {dayTasks.length > 0 && (
                <span className="text-xs text-gray-400 ml-auto">
                  {dayTasks.filter(t => t.done).length}/{dayTasks.length}
                </span>
              )}
            </div>
            {dayTasks.length === 0 ? (
              <div className="ml-10 text-sm text-gray-300">Немає задач</div>
            ) : (
              <ul className="ml-10 space-y-1.5">
                {dayTasks.map(task => (
                  <li key={task.id} className={`flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm ${task.done ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => onToggle(task.id)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.done ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'}`}
                    >
                      {task.done && <span className="text-[10px] leading-none">✓</span>}
                    </button>
                    <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`} onClick={() => onOpenDetail(task)}>
                      {task.title}
                    </span>
                    {task.priority === 'must' && !task.done && <span className="text-xs">🔥</span>}
                    {task.duration && !task.done && <span className="text-xs text-gray-400">{task.duration}</span>}
                  </li>
                ))}
              </ul>
            )}
            <div className="border-b border-gray-100 mt-3" />
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
        <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200 text-lg">‹</button>
        <button onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200 text-lg">›</button>
      </div>

      {/* day headers */}
      <div className="grid grid-cols-7 px-2 mb-1">
        {DAY_NAMES_SHORT.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
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
              className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                isSelected ? 'bg-indigo-600' :
                isToday ? 'bg-indigo-100' :
                'active:bg-gray-100'
              }`}
            >
              <span className={`text-sm font-medium leading-none ${
                isSelected ? 'text-white' :
                isToday ? 'text-indigo-600' :
                isPast ? 'text-gray-300' :
                'text-gray-700'
              }`}>
                {day.getDate()}
              </span>
              <div className="flex gap-0.5 mt-1 h-1.5">
                {dayTasks.length > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' :
                    allDone ? 'bg-green-400' :
                    hasMust ? 'bg-red-400' :
                    'bg-indigo-400'
                  }`} />
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
            <p className="text-sm font-medium text-gray-600 mb-2">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-gray-300">Немає задач</p>
            ) : (
              <ul className="space-y-2">
                {selectedTasks.map(task => (
                  <li key={task.id} className={`flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2.5 shadow-sm ${task.done ? 'opacity-50' : ''}`}
                    onClick={() => onOpenDetail(task)}>
                    <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</span>
                    {task.priority === 'must' && !task.done && <span className="text-xs">🔥</span>}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-300 text-center mt-4">Натисни на день щоб побачити задачі</p>
        )}
      </div>
    </div>
  )
}
