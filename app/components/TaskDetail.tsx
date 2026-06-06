'use client'
import { useState } from 'react'
import { Task } from '../types'

export default function TaskDetail({
  task,
  onUpdate,
  onClose,
}: {
  task: Task
  onUpdate: (id: string, changes: Partial<Task>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState(task.priority ?? 'nice')
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [duration, setDuration] = useState(task.duration ?? '')

  function handleSave() {
    onUpdate(task.id, {
      title: title.trim() || task.title,
      priority,
      dueDate: dueDate || undefined,
      duration: duration.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl shadow-2xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-2" />

        <h2 className="text-lg font-semibold text-gray-800">Редагувати задачу</h2>

        {/* title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Назва</label>
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={2}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* priority */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Пріоритет</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPriority('must')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                priority === 'must'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              🔥 Важливо
            </button>
            <button
              onClick={() => setPriority('nice')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                priority === 'nice'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              ✨ Бажано
            </button>
          </div>
        </div>

        {/* due date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Дедлайн</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {dueDate && (
            <button
              onClick={() => setDueDate('')}
              className="text-xs text-gray-400 text-left"
            >
              × Прибрати дату
            </button>
          )}
        </div>

        {/* duration */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Тривалість</label>
          <input
            type="text"
            placeholder="напр. 30 хв, 1 год"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* save */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold text-base active:bg-indigo-700 transition-colors"
        >
          Зберегти
        </button>
      </div>
    </div>
  )
}
