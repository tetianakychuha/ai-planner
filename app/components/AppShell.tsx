'use client'
import { useState, useRef, useCallback } from 'react'
import { useTasks } from '../store'
import { Task } from '../types'
import CaptureScreen from './CaptureScreen'
import InboxScreen from './InboxScreen'
import TodayScreen from './TodayScreen'

type Tab = 'capture' | 'inbox' | 'today'

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('capture')
  const store = useTasks()
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-white shadow-sm">
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
          />
        )}
        {tab === 'today' && (
          <TodayScreen
            tasks={store.todayTasks}
            onToggle={store.toggleDone}
            onMoveToInbox={store.moveToInbox}
            onDelete={handleDelete}
            onUpdateTitle={store.updateTitle}
          />
        )}
      </main>

      {/* undo toast */}
      {undoTask && (
        <div className="absolute bottom-24 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg z-50 animate-fade-in">
          <span className="text-sm truncate mr-3">Видалено: {undoTask.title}</span>
          <button
            onClick={handleUndo}
            className="text-indigo-300 font-semibold text-sm flex-shrink-0"
          >
            Скасувати
          </button>
        </div>
      )}

      {/* bottom nav */}
      <nav className="flex border-t border-gray-200 bg-white safe-bottom">
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
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
        active ? 'text-indigo-600' : 'text-gray-500'
      }`}
    >
      <span className="relative text-2xl leading-none">
        {emoji}
        {!!badge && badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-indigo-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {badge}
          </span>
        )}
      </span>
      <span className={`text-xs font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </button>
  )
}
