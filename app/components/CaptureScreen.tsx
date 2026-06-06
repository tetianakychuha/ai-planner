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

  const hasText = text.trim().length > 0

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: '#222631' }}>
      <h1
        className="pt-2"
        style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.95)' }}
      >
        Що потрібно зробити?
      </h1>

      <textarea
        className="flex-1 w-full resize-none focus:outline-none"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '16px',
          fontSize: '17px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.95)',
          fontFamily: 'inherit',
        }}
        placeholder="Напиши все підряд... наприклад: написати Анні, доробити презу, о 15 дзвінок"
        value={text}
        onChange={e => setText(e.target.value)}
        autoFocus
      />

      <style>{`textarea::placeholder { color: rgba(255,255,255,0.45); }`}</style>

      {error && <p className="text-sm text-center" style={{ color: '#FD3433' }}>{error}</p>}

      <div className="flex gap-3">
        {/* mic button */}
        <button
          onClick={toggleVoice}
          disabled={loading}
          className="flex items-center justify-center text-2xl transition-all"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '9999px',
            background: listening ? '#FD3433' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: listening ? '#FFFFFF' : 'rgba(255,255,255,0.70)',
            flexShrink: 0,
          }}
          aria-label={listening ? 'Зупинити запис' : 'Голосовий ввід'}
        >
          🎙️
        </button>

        {/* save button */}
        <button
          onClick={handleSave}
          disabled={!hasText || loading}
          className="flex-1 transition-colors flex items-center justify-center gap-2"
          style={{
            height: '52px',
            borderRadius: '16px',
            background: hasText && !loading ? '#FD3433' : 'rgba(253,52,51,0.35)',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 500,
          }}
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
