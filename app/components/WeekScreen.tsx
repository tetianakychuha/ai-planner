'use client'
import { Task } from '../types'

const DAY_NAMES = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const DAY_NAMES_FULL = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота']

function getWeekDays(): Date[] {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
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
  const days = getWeekDays()
  const today = toDateStr(new Date())

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-gray-800">Тиждень</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {days[0].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })} —{' '}
          {days[6].toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {days.map(day => {
          const dateStr = toDateStr(day)
          const isToday = dateStr === today
          const isPast = dateStr < today

          const dayTasks = tasks.filter(t => {
            const taskDate = t.dueDate || (t.list === 'today' && t.scheduledDate)
            return taskDate === dateStr
          }).sort((a, b) => {
            if (a.priority === 'must' && b.priority !== 'must') return -1
            if (a.priority !== 'must' && b.priority === 'must') return 1
            return 0
          })

          return (
            <div key={dateStr}>
              {/* day header */}
              <div className={`flex items-center gap-2 mb-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                  isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
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

              {/* tasks */}
              {dayTasks.length === 0 ? (
                <div className={`ml-10 text-sm ${isPast && !isToday ? 'text-gray-300' : 'text-gray-300'}`}>
                  Немає задач
                </div>
              ) : (
                <ul className="ml-10 space-y-1.5">
                  {dayTasks.map(task => (
                    <li
                      key={task.id}
                      className={`flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm ${task.done ? 'opacity-50' : ''}`}
                    >
                      <button
                        onClick={() => onToggle(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          task.done ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'
                        }`}
                      >
                        {task.done && <span className="text-[10px] leading-none">✓</span>}
                      </button>
                      <span
                        className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}
                        onClick={() => onOpenDetail(task)}
                      >
                        {task.title}
                      </span>
                      {task.priority === 'must' && !task.done && (
                        <span className="text-xs">🔥</span>
                      )}
                      {task.duration && !task.done && (
                        <span className="text-xs text-gray-400">{task.duration}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* divider */}
              <div className="border-b border-gray-100 mt-3" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
