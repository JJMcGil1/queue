import { useEffect, useState } from 'react'
import type { Item } from '../../../shared/types'
import { TYPE_LABELS, STATUS_META, initials } from '../lib/meta'
import { cx } from '../lib/cx'

interface Props {
  item: Item
  onEdit: (item: Item) => void
  onCycleStatus: (item: Item) => void
}

export function PosterCard({ item, onEdit, onCycleStatus }: Props) {
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [item.image])

  const status = STATUS_META[item.status]

  return (
    <article className="group">
      <div
        className={cx(
          'relative aspect-[2/3] overflow-hidden rounded-xl bg-surface ring-1 ring-line',
          item.status === 'watched' && 'opacity-60 saturate-[.75] transition-opacity duration-150 group-hover:opacity-100 group-hover:saturate-100'
        )}
      >
        {item.image && !broken ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setBroken(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="select-none text-4xl font-semibold text-white/10">
              {initials(item.title)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-start justify-end bg-black/50 p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.title}`}
            className="flex size-8 items-center justify-center rounded-lg bg-white/15 text-ink transition-colors duration-150 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M11.3 1.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5.6 13.4 2 14l.6-3.6 8.7-8.7Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-2.5 min-w-0">
        <h3 className="truncate text-sm font-medium">{item.title}</h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="shrink-0 text-xs text-muted">{TYPE_LABELS[item.type]}</span>
          <button
            type="button"
            onClick={() => onCycleStatus(item)}
            title="Change status"
            className="-mr-2 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs text-muted transition-colors duration-150 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span className={cx('size-1.5 rounded-full', status.dot)} aria-hidden="true" />
            {status.label}
          </button>
        </div>
      </div>
    </article>
  )
}
