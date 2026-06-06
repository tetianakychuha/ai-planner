'use client'

type Props = {
  count: number
  onRollover: () => void
  onDismiss: () => void
}

export default function RolloverBanner({ count, onRollover, onDismiss }: Props) {
  return (
    <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-sm text-amber-800 font-medium">
        {count === 1
          ? '1 невиконана задача з вчора'
          : `${count} невиконані задачі з вчора`}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRollover}
          className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium active:bg-amber-600 transition-colors"
        >
          Перенести на сьогодні
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-medium active:bg-amber-200 transition-colors"
        >
          Відхилити
        </button>
      </div>
    </div>
  )
}
