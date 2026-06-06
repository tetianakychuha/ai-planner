'use client'
import { Task } from '../types'
import { Flame, AlertTriangle } from 'lucide-react'

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

  const perDay = last7.map(dateStr => {
    const count = doneTasks.filter(t => {
      const d = t.scheduledDate || t.dueDate
      return d === dateStr
    }).length
    return { dateStr, count }
  })
  const maxPerDay = Math.max(...perDay.map(d => d.count), 1)

  const labelMap: Record<string, number> = {}
  allTasks.forEach(t => (t.labels ?? []).forEach(l => {
    labelMap[l] = (labelMap[l] ?? 0) + 1
  }))
  const topLabels = Object.entries(labelMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxLabel = topLabels[0]?.[1] ?? 1

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
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg-screen)' }}>
      <div className="px-4 pt-5 pb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Аналітика</h1>
        <p style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '2px' }}>Твій прогрес</p>
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
          <div style={{ background: 'var(--color-accent-10)', border: '1px solid var(--color-accent-25)', borderRadius: '16px', padding: '16px' }}>
            <p className="flex items-center gap-1.5" style={{ fontSize: '13px', fontWeight: 500, color: '#FD3433', marginBottom: '4px' }}><Flame size={13} strokeWidth={2} />Важливі задачі</p>
            <p style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.02em', color: '#FD3433' }}>{mustDone} / {mustTasks.length}</p>
            <div className="mt-2 overflow-hidden" style={{ height: '4px', background: 'var(--color-accent-20)', borderRadius: '9999px' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${mustTasks.length > 0 ? Math.round((mustDone / mustTasks.length) * 100) : 0}%`,
                  background: '#FD3433',
                  borderRadius: '9999px',
                }}
              />
            </div>
          </div>
        )}

        {/* 7-day bar chart */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>Виконано за 7 днів</p>
          <div className="flex items-end gap-1.5 h-20">
            {perDay.map(({ dateStr, count }) => {
              const d = new Date(dateStr + 'T12:00:00')
              const isToday = dateStr === today
              const height = count === 0 ? 6 : Math.max(16, Math.round((count / maxPerDay) * 72))
              return (
                <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${height}px`,
                      background: count === 0 ? 'var(--color-accent-18)' : '#FD3433',
                    }}
                  />
                  <span style={{ fontSize: '10px', color: isToday ? '#FD3433' : 'var(--text-tertiary)', fontWeight: isToday ? 600 : 400 }}>
                    {DAY_SHORT[d.getDay()]}
                  </span>
                  {count > 0 && <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{count}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* label distribution */}
        {topLabels.length > 0 && (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>Задачі за категоріями</p>
            <div className="flex flex-col gap-2">
              {topLabels.map(([label, count]) => (
                <div key={label} className="flex items-center gap-2">
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '80px' }} className="truncate">#{label}</span>
                  <div className="flex-1 overflow-hidden" style={{ height: '6px', background: 'var(--color-accent-18)', borderRadius: '9999px' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${Math.round((count / maxLabel) * 100)}%`, background: '#FD3433', borderRadius: '9999px' }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', width: '16px', textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* overdue warning */}
        {(() => {
          const overdue = allTasks.filter(t => !t.done && t.dueDate && t.dueDate < today).length
          return overdue > 0 ? (
            <div className="flex items-center gap-3" style={{ background: 'var(--color-accent-10)', border: '1px solid var(--color-accent-25)', borderRadius: '16px', padding: '16px' }}>
              <AlertTriangle size={22} strokeWidth={1.75} color="#FD3433" />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#FD3433' }}>{overdue} прострочених задач</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Перевір Inbox і Today</p>
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
    <div
      style={{
        borderRadius: '16px',
        padding: '16px',
        background: highlight ? 'var(--color-accent-10)' : 'var(--bg-card)',
        border: highlight ? '1px solid var(--color-accent-25)' : '1px solid var(--border-subtle)',
      }}
    >
      <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', color: highlight ? '#FD3433' : 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.02em', color: highlight ? '#FD3433' : 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}
