'use client'
import { useState } from 'react'
import { useTasks } from '../store'
import CaptureScreen from './CaptureScreen'
import InboxScreen from './InboxScreen'
import TodayScreen from './TodayScreen'

type Tab = 'capture' | 'inbox' | 'today'

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('capture')
  const store = useTasks()

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-white shadow-sm">
      {/* screen */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'capture' && (
          <CaptureScreen onSave={(text) => { store.addTask(text); setTab('inbox') }} />
        )}
        {tab === 'inbox' && (
          <InboxScreen
            tasks={store.inboxTasks}
            onMoveToToday={store.moveToToday}
            onDelete={store.deleteTask}
          />
        )}
        {tab === 'today' && (
          <TodayScreen
            tasks={store.todayTasks}
            onToggle={store.toggleDone}
            onMoveToInbox={store.moveToInbox}
            onDelete={store.deleteTask}
          />
        )}
      </main>

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
