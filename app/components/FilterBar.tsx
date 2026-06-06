'use client'

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
  function chip(label: string, active: boolean, onClick: () => void) {
    return (
      <button
        key={label}
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
          active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      {/* priority + date row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {chip('Всі', isDefault(filters), () => onChange(DEFAULT_FILTERS))}
        {chip('🔥 Важливо', filters.priority === 'must', () =>
          onChange({ ...filters, priority: filters.priority === 'must' ? 'all' : 'must' }))}
        {chip('✨ Бажано', filters.priority === 'nice', () =>
          onChange({ ...filters, priority: filters.priority === 'nice' ? 'all' : 'nice' }))}
        {chip('⏰ Прострочено', filters.date === 'overdue', () =>
          onChange({ ...filters, date: filters.date === 'overdue' ? 'all' : 'overdue' }))}
        {chip('📅 Сьогодні', filters.date === 'today', () =>
          onChange({ ...filters, date: filters.date === 'today' ? 'all' : 'today' }))}
        {chip('🗓 Цього тижня', filters.date === 'week', () =>
          onChange({ ...filters, date: filters.date === 'week' ? 'all' : 'week' }))}
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
