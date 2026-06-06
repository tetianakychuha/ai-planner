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

type Tab = 'capture' | 'inbox' | 'today' | 'week' | 'stats'

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('capture')
  const store = useTasks()
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showRollover, setShowRollover] = useState(false)
  const [detailTask, setDetailTask] = useState<Task | null>(null)

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

  // auto-move inbox tasks with today's dueDate to Today
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    store.inboxTasks
      .filter(t => t.dueDate === today)
      .forEach(t => store.moveToToday(t.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div className="flex flex-col h-dvh max-w-md mx-auto" style={{ background: '#F2F2F7' }}>
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
        <div className="absolute bottom-24 left-4 right-4 max-w-md mx-auto text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg z-50 animate-fade-in" style={{ background: '#1C1C1E' }}>
          <span className="text-sm truncate mr-3">Видалено: {undoTask.title}</span>
          <button
            onClick={handleUndo}
            className="font-semibold text-sm flex-shrink-0"
            style={{ color: '#EDE9FF' }}
          >
            Скасувати
          </button>
        </div>
      )}

      {/* bottom nav */}
      <nav
        className="flex bg-white safe-bottom"
        style={{ boxShadow: '0 -0.5px 0 rgba(60,60,67,0.12)' }}
      >
        <TabButton active={tab === 'capture'} onClick={() => setTab('capture')} emoji="✏️" label="Capture" />
        <TabButton
          active={tab === 'inbox'}
          onClick={() => setTab('inbox')}
          emoji="📥"
          label="Inbox"
          badge={store.inboxTasks.length}
        />
        <TabButton
          active={tab === 'today'}
          onClick={() => setTab('today')}
          emoji="☀️"
          label="Today"
          badge={store.todayTasks.filter(t => !t.done).length}
        />
        <TabButton active={tab === 'week'} onClick={() => setTab('week')} emoji="📅" label="Календар" />
        <TabButton active={tab === 'stats'} onClick={() => setTab('stats')} emoji="📊" label="Статистика" />
      </nav>
    </div>
  )
}

function TabButton({
  active, onClick, emoji, label, badge,
}: {
  active: boolean; onClick: () => void; emoji: string; label: string; badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
      style={{ color: active ? '#6B4EFF' : '#AEAEB2' }}
    >
      <span className="relative text-2xl leading-none">
        {emoji}
        {!!badge && badge > 0 && (
          <span
            className="absolute -top-1 -right-2 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
            style={{ background: '#FF3B30' }}
          >
            {badge}
          </span>
        )}
      </span>
      <span
        className="font-medium"
        style={{ fontSize: '10px', color: active ? '#6B4EFF' : '#AEAEB2' }}
      >
        {label}
      </span>
    </button>
  )
}
