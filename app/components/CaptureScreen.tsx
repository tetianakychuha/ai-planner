'use client'
import { useState, useRef } from 'react'
import { Task } from '../types'

type ParsedTask = Pick<Task, 'title' | 'priority' | 'dueDate' | 'duration'>

export default function CaptureScreen({ onSave }: { onSave: (tasks: ParsedTask[]) => void }) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  function toggleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition

    if (!SR) {
      alert('Голосовий ввід не підтримується цим браузером')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any
    recognition.lang = 'uk-UA'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = Array.from(Object.values(e.results))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript as string)
        .join(' ')
      setText(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  async function handleSave() {
    const trimmed = text.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()
      onSave(data.tasks)
      setText('')
    } catch {
      setError('Не вдалося розпізнати. Спробуй ще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-xl font-semibold text-gray-800 pt-2">Що потрібно зробити?</h1>

      <textarea
        className="flex-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-400"
        placeholder="Напиши все підряд... наприклад: написати Анні, доробити презу, о 15 дзвінок"
        value={text}
        onChange={e => setText(e.target.value)}
        autoFocus
      />

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex gap-3">
        {/* mic button */}
        <button
          onClick={toggleVoice}
          disabled={loading}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow transition-all ${
            listening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 text-gray-600 active:bg-gray-200'
          }`}
          aria-label={listening ? 'Зупинити запис' : 'Голосовий ввід'}
        >
          🎙️
        </button>

        {/* save button */}
        <button
          onClick={handleSave}
          disabled={!text.trim() || loading}
          className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-semibold text-base shadow disabled:opacity-40 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Аналізую...
            </>
          ) : (
            'Зберегти в Inbox'
          )}
        </button>
      </div>
    </div>
  )
}
