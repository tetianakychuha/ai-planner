'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useTasks } from '../store'
import { Task } from '../types'
import CaptureScreen from './CaptureScreen'
import InboxScreen from './InboxScreen'
import TodayScreen from './TodayScreen'
import RolloverBanner from './RolloverBanner'
import TaskDetail from './TaskDetail'
import WeekScreen from './WeekScreen'
import StatsScreen from './StatsScreen'
import { PenLine, Inbox, Sun, CalendarDays, BarChart2, Moon } from 'lucide-react'

type Tab = 'capture' | 'inbox' | 'today' | 'week' | 'stats'

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('capture')
  const store = useTasks()
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showRollover, setShowRollover] = useState(false)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'dark' | 'light') || 'dark' : 'dark'
  )

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const staleTasks = store.todayTasks.filter(
    t => !t.done && t.scheduledDate && t.scheduledDate <= yesterdayStr
  )

  useEffect(() => {
    if (staleTasks.length > 0) setShowRollover(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staleTasks.length])

  const autoMovedRef = useRef(false)
  useEffect(() => {
    if (autoMovedRef.current || store.tasks.length === 0) return
    autoMovedRef.current = true
    const today = new Date().toISOString().slice(0, 10)
    store.inboxTasks
      .filter(t => t.dueDate === today)
      .forEach(t => store.moveToToday(t.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tasks.length])

  const handleDelete = useCallback((id: string) => {
    const task = store.tasks.find(t => t.id === id)
    if (!task) return

    store.deleteTask(id)
    setUndoTask(task)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setUndoTask(null), 4000)
  }, [store])

  const handleUndo = useCallback(() => {
    if (!undoTask) return
    if (timerRef.current) clearTimeout(timerRef.current)
    store.addTasks([undoTask])
    setUndoTask(null)
  }, [undoTask, store])

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto relative" data-theme={theme} style={{ background: 'var(--bg-screen)' }}>
      {/* rollover banner */}
      {showRollover && staleTasks.length > 0 && (
        <RolloverBanner
          count={staleTasks.length}
          onRollover={() => {
            store.rescheduleToToday(staleTasks.map(t => t.id))
            setShowRollover(false)
          }}
          onDismiss={() => setShowRollover(false)}
        />
      )}

      {/* theme toggle */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '9999px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'dark'
            ? <Moon size={20} strokeWidth={1.75} color="var(--text-secondary)" />
            : <Sun size={20} strokeWidth={1.75} color="var(--text-secondary)" />
          }
        </button>
      </div>

      {/* screen */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'capture' && (
          <CaptureScreen onSave={(tasks) => { store.addTasks(tasks); setTab('inbox') }} />
        )}
        {tab === 'inbox' && (
          <InboxScreen
            tasks={store.inboxTasks}
            onMoveToToday={store.moveToToday}
            onDelete={handleDelete}
            onUpdateTitle={store.updateTitle}
            onUpdateDueDate={store.updateDueDate}
            onOpenDetail={setDetailTask}
          />
        )}
        {tab === 'stats' && <StatsScreen tasks={store.tasks} />}
        {tab === 'week' && (
          <WeekScreen
            tasks={store.tasks}
            onOpenDetail={setDetailTask}
            onToggle={store.toggleDone}
            onMoveToDate={(id, date) => store.updateTask(id, { dueDate: date })}
          />
        )}
        {tab === 'today' && (
          <TodayScreen
            tasks={store.todayTasks}
            onToggle={store.toggleDone}
            onMoveToInbox={store.moveToInbox}
            onDelete={handleDelete}
            onUpdateTitle={store.updateTitle}
            onUpdateDueDate={store.updateDueDate}
            onOpenDetail={setDetailTask}
          />
        )}
      </main>

      {/* task detail modal */}
      {detailTask && (
        <TaskDetail
          task={detailTask}
          onUpdate={store.updateTask}
          onClose={() => setDetailTask(null)}
        />
      )}

      {/* undo toast */}
      {undoTask && (
        <div
          className="absolute bottom-24 left-4 right-4 max-w-md mx-auto rounded-2xl px-4 py-3 flex items-center justify-between z-50 animate-fade-in"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
        >
          <span className="text-sm truncate mr-3">Видалено: {undoTask.title}</span>
          <button
            onClick={handleUndo}
            className="font-medium text-sm flex-shrink-0"
            style={{ color: '#FD3433' }}
          >
            Скасувати
          </button>
        </div>
      )}

      {/* bottom nav */}
      <nav
        className="flex safe-bottom"
        style={{ background: 'var(--tab-bg)', borderTop: '1px solid var(--tab-border)' }}
      >
        <TabButton active={tab === 'capture'} onClick={() => setTab('capture')} icon={PenLine} label="Capture" />
        <TabButton
          active={tab === 'inbox'}
          onClick={() => setTab('inbox')}
          icon={Inbox}
          label="Inbox"
          badge={store.inboxTasks.length}
        />
        <TabButton
          active={tab === 'today'}
          onClick={() => setTab('today')}
          icon={Sun}
          label="Today"
          badge={store.todayTasks.filter(t => !t.done).length}
        />
        <TabButton active={tab === 'week'} onClick={() => setTab('week')} icon={CalendarDays} label="Calendar" />
        <TabButton active={tab === 'stats'} onClick={() => setTab('stats')} icon={BarChart2} label="Stats" />
      </nav>
    </div>
  )
}

function TabButton({
  active, onClick, icon: Icon, label, badge,
}: {
  active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>; label: string; badge?: number
}) {
  const color = active ? '#FD3433' : 'var(--tab-inactive)'
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
    >
      <span className="relative leading-none">
        <Icon size={24} strokeWidth={1.75} color={color} />
        {!!badge && badge > 0 && (
          <span
            className="absolute -top-1 -right-2 text-white text-[10px] font-medium rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
            style={{ background: '#FD3433' }}
          >
            {badge}
          </span>
        )}
      </span>
      <span
        className="font-medium"
        style={{ fontSize: '10px', color }}
      >
        {label}
      </span>
    </button>
  )
}
