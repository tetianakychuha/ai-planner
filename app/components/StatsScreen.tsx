'use client'
import { Task } from '../types'

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return toDateStr(d)
  })
}

const DAY_SHORT = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export default function StatsScreen({ tasks }: { tasks: Task[] }) {
  const today = toDateStr(new Date())
  const last7 = getLast7Days()

  const allTasks = tasks
  const doneTasks = allTasks.filter(t => t.done)
  const totalRate = allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0

  const todayTasks = allTasks.filter(t => t.list === 'today')
  const todayDone = todayTasks.filter(t => t.done).length

  const mustTasks = allTasks.filter(t => t.priority === 'must')
  const mustDone = mustTasks.filter(t => t.done).length

  // tasks completed per day (by scheduledDate or dueDate)
  const perDay = last7.map(dateStr => {
    const count = doneTasks.filter(t => {
      const d = t.scheduledDate || t.dueDate
      return d === dateStr
    }).length
    return { dateStr, count }
  })
  const maxPerDay = Math.max(...perDay.map(d => d.count), 1)

  // label distribution
  const labelMap: Record<string, number> = {}
  allTasks.forEach(t => (t.labels ?? []).forEach(l => {
    labelMap[l] = (labelMap[l] ?? 0) + 1
  }))
  const topLabels = Object.entries(labelMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxLabel = topLabels[0]?.[1] ?? 1

  // streak
  let streak = 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = toDateStr(d)
    if (ds === today) break
    const had = doneTasks.some(t => (t.scheduledDate || t.dueDate) === ds)
    if (had) streak++
    else streak = 0
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-gray-800">Аналітика</h1>
        <p className="text-sm text-gray-400 mt-0.5">Твій прогрес</p>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-4">

        {/* top stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Всього задач" value={allTasks.length} />
          <StatCard label="Виконано" value={doneTasks.length} highlight />
          <StatCard label="Виконано сьогодні" value={`${todayDone}/${todayTasks.length}`} />
          <StatCard label="Загальний %" value={`${totalRate}%`} highlight={totalRate >= 50} />
        </div>

        {/* must stats */}
        {mustTasks.length > 0 && (
          <div className="bg-red-50 rounded-2xl p-4">
            <p className="text-sm font-medium text-red-700 mb-1">🔥 Важливі задачі</p>
            <p className="text-2xl font-bold text-red-600">{mustDone} / {mustTasks.length}</p>
            <div className="mt-2 h-2 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-500"
                style={{ width: `${mustTasks.length > 0 ? Math.round((mustDone / mustTasks.length) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* 7-day bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Виконано за 7 днів</p>
          <div className="flex items-end gap-1.5 h-20">
            {perDay.map(({ dateStr, count }) => {
              const d = new Date(dateStr + 'T12:00:00')
              const isToday = dateStr === today
              const height = count === 0 ? 4 : Math.max(16, Math.round((count / maxPerDay) * 72))
              return (
                <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all ${isToday ? 'bg-indigo-500' : 'bg-indigo-200'}`}
                    style={{ height: `${height}px` }}
                  />
                  <span className={`text-[10px] ${isToday ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                    {DAY_SHORT[d.getDay()]}
                  </span>
                  {count > 0 && <span className="text-[10px] text-gray-500">{count}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* label distribution */}
        {topLabels.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Задачі за категоріями</p>
            <div className="flex flex-col gap-2">
              {topLabels.map(([label, count]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20 truncate">#{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((count / maxLabel) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* overdue warning */}
        {(() => {
          const overdue = allTasks.filter(t => !t.done && t.dueDate && t.dueDate < today).length
          return overdue > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-800">{overdue} прострочених задач</p>
                <p className="text-xs text-amber-600 mt-0.5">Перевір Inbox і Today</p>
              </div>
            </div>
          ) : null
        })()}

      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-indigo-50' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-indigo-600' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}
