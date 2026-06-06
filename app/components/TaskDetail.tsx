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

  const fieldLabelStyle = {
    fontSize: '11px',
    fontWeight: 500,
    color: '#AEAEB2',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  }

  const inputStyle = {
    background: '#F2F2F7',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '17px',
    fontWeight: 500,
    color: '#1C1C1E',
    border: 'none',
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div
        className="flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        style={{
          background: '#FFFFFF',
          borderRadius: '20px 20px 0 0',
          padding: '24px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* drag handle */}
        <div
          className="mx-auto -mt-2"
          style={{ width: '36px', height: '4px', background: 'rgba(60,60,67,0.12)', borderRadius: '9999px' }}
        />

        <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1C1C1E' }}>Редагувати задачу</h2>

        {/* title */}
        <div className="flex flex-col gap-1.5">
          <label style={fieldLabelStyle}>Назва</label>
          <textarea
            className="resize-none focus:outline-none focus:ring-2"
            style={{ ...inputStyle, borderRadius: '12px' }}
            rows={2}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* priority */}
        <div className="flex flex-col gap-1.5">
          <label style={fieldLabelStyle}>Пріоритет</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPriority('must')}
              className="flex-1 transition-colors"
              style={{
                height: '48px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 500,
                background: priority === 'must' ? '#FF3B30' : '#F2F2F7',
                color: priority === 'must' ? '#FFFFFF' : '#6C6C70',
              }}
            >
              🔥 Важливо
            </button>
            <button
              onClick={() => setPriority('nice')}
              className="flex-1 transition-colors"
              style={{
                height: '48px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 500,
                background: priority === 'nice' ? '#6B4EFF' : '#F2F2F7',
                color: priority === 'nice' ? '#FFFFFF' : '#6C6C70',
              }}
            >
              ✨ Бажано
            </button>
          </div>
        </div>

        {/* due date */}
        <div className="flex flex-col gap-1.5">
          <label style={fieldLabelStyle}>Дедлайн</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={inputStyle}
          />
          {dueDate && (
            <button
              onClick={() => setDueDate('')}
              style={{ fontSize: '12px', color: '#AEAEB2', textAlign: 'left' }}
            >
              × Прибрати дату
            </button>
          )}
        </div>

        {/* duration */}
        <div className="flex flex-col gap-1.5">
          <label style={fieldLabelStyle}>Тривалість</label>
          <input
            type="text"
            placeholder="напр. 30 хв, 1 год"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* save */}
        <button
          onClick={handleSave}
          className="w-full transition-colors"
          style={{
            height: '52px',
            borderRadius: '16px',
            background: '#6B4EFF',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Зберегти
        </button>
      </div>
    </div>
  )
}
