import { Task } from '../types'
import { Filters } from '../components/FilterBar'

export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  const today = new Date().toISOString().slice(0, 10)
  const weekEnd = (() => {
    const d = new Date()
    d.setDate(d.getDate() + (7 - ((d.getDay() + 6) % 7)))
    return d.toISOString().slice(0, 10)
  })()

  return tasks.filter(t => {
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false

    if (filters.date === 'overdue' && (!t.dueDate || t.dueDate >= today)) return false
    if (filters.date === 'today' && t.dueDate !== today) return false
    if (filters.date === 'week' && (!t.dueDate || t.dueDate < today || t.dueDate > weekEnd)) return false

    if (filters.label && !(t.labels ?? []).includes(filters.label)) return false

    return true
  })
}

export function collectLabels(tasks: Task[]): string[] {
  const set = new Set<string>()
  tasks.forEach(t => (t.labels ?? []).forEach(l => set.add(l)))
  return Array.from(set).sort()
}
