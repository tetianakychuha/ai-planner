'use client'
import { Flame, Sparkles, AlarmClock, CalendarDays, CalendarRange } from 'lucide-react'

export type PriorityFilter = 'all' | 'must' | 'nice'
export type DateFilter = 'all' | 'overdue' | 'today' | 'week'

export type Filters = {
  priority: PriorityFilter
  date: DateFilter
  label: string | null
}

export const DEFAULT_FILTERS: Filters = { priority: 'all', date: 'all', label: null }

export function isDefault(f: Filters) {
  return f.priority === 'all' && f.date === 'all' && f.label === null
}

export default function FilterBar({
  filters,
  onChange,
  availableLabels,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  availableLabels: string[]
}) {
  function chip(label: string, active: boolean, onClick: () => void, icon?: React.ReactNode) {
    return (
      <button
        key={label}
        onClick={onClick}
        className="whitespace-nowrap transition-colors flex items-center gap-1"
        style={{
          padding: '5px 12px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 500,
          background: active ? '#FD3433' : 'var(--border-subtle)',
          color: active ? '#FFFFFF' : 'var(--text-secondary)',
        }}
      >
        {icon}{label}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      {/* priority + date row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {chip('Всі', isDefault(filters), () => onChange(DEFAULT_FILTERS))}
        {chip('Важливо', filters.priority === 'must', () =>
          onChange({ ...filters, priority: filters.priority === 'must' ? 'all' : 'must' }),
          <Flame size={13} strokeWidth={2} />)}
        {chip('Бажано', filters.priority === 'nice', () =>
          onChange({ ...filters, priority: filters.priority === 'nice' ? 'all' : 'nice' }),
          <Sparkles size={13} strokeWidth={2} />)}
        {chip('Прострочено', filters.date === 'overdue', () =>
          onChange({ ...filters, date: filters.date === 'overdue' ? 'all' : 'overdue' }),
          <AlarmClock size={13} strokeWidth={2} />)}
        {chip('Сьогодні', filters.date === 'today', () =>
          onChange({ ...filters, date: filters.date === 'today' ? 'all' : 'today' }),
          <CalendarDays size={13} strokeWidth={2} />)}
        {chip('Цього тижня', filters.date === 'week', () =>
          onChange({ ...filters, date: filters.date === 'week' ? 'all' : 'week' }),
          <CalendarRange size={13} strokeWidth={2} />)}
      </div>

      {/* labels row */}
      {availableLabels.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {availableLabels.map(l =>
            chip(`#${l}`, filters.label === l, () =>
              onChange({ ...filters, label: filters.label === l ? null : l }))
          )}
        </div>
      )}
    </div>
  )
}
