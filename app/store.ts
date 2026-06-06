'use client'
import { useState, useEffect, useCallback } from 'react'
import { Task } from './types'

const STORAGE_KEY = 'ai-planner-tasks'

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setTasks(loadTasks())
  }, [])

  const persist = useCallback((updated: Task[]) => {
    setTasks(updated)
    saveTasks(updated)
  }, [])

  const addTask = useCallback((title: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      done: false,
      list: 'inbox',
      createdAt: new Date().toISOString(),
    }
    persist([...tasks, task])
  }, [tasks, persist])

  const moveToToday = useCallback((id: string) => {
    persist(tasks.map(t => t.id === id ? { ...t, list: 'today' } : t))
  }, [tasks, persist])

  const moveToInbox = useCallback((id: string) => {
    persist(tasks.map(t => t.id === id ? { ...t, list: 'inbox', done: false } : t))
  }, [tasks, persist])

  const toggleDone = useCallback((id: string) => {
    persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }, [tasks, persist])

  const deleteTask = useCallback((id: string) => {
    persist(tasks.filter(t => t.id !== id))
  }, [tasks, persist])

  const inboxTasks = tasks.filter(t => t.list === 'inbox')
  const todayTasks = tasks.filter(t => t.list === 'today')

  return { tasks, inboxTasks, todayTasks, addTask, moveToToday, moveToInbox, toggleDone, deleteTask }
}
