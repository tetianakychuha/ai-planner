'use client'
import { Task } from '../types'

export default function InboxScreen({
  tasks,
  onMoveToToday,
  onDelete,
}: {
  tasks: Task[]
  onMoveToToday: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-gray-800">Inbox</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {tasks.length === 0 ? 'Порожньо — чудово!' : `${tasks.length} задач`}
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState emoji="📭" text="Немає нових задач. Додай через Capture!" />
      ) : (
        <ul className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {tasks.map(task => (
            <li key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-base text-gray-800 mb-3 leading-snug">{task.title}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onMoveToToday(task.id)}
                  className="flex-1 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium active:bg-indigo-100 transition-colors"
                >
                  ☀️ На сьогодні
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="w-11 h-10 rounded-xl bg-red-50 text-red-500 text-lg flex items-center justify-center active:bg-red-100 transition-colors"
                  aria-label="Видалити"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-16">
      <span className="text-5xl">{emoji}</span>
      <p className="text-gray-400 text-center px-8">{text}</p>
    </div>
  )
}
