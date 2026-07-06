import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import type { Item, ItemInput, MediaType, Status } from '../../shared/types'
import { PosterCard } from './components/PosterCard'
import { ItemDialog } from './components/ItemDialog'
import { Segmented } from './components/Segmented'
import { nextStatus } from './lib/meta'

const STATUS_FILTERS: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not_watched', label: 'Not watched' },
  { value: 'watching', label: 'Watching' },
  { value: 'watched', label: 'Watched' }
]

const TYPE_FILTERS: { value: MediaType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'movie', label: 'Movies' },
  { value: 'show', label: 'TV Shows' },
  { value: 'documentary', label: 'Documentaries' },
  { value: 'anime', label: 'Anime' },
  { value: 'other', label: 'Other' }
]

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [type, setType] = useState<MediaType | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)

  useEffect(() => {
    api.list().then((rows) => {
      setItems(rows)
      setLoaded(true)
    })
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(
      (it) =>
        (status === 'all' || it.status === status) &&
        (type === 'all' || it.type === type) &&
        (q === '' || it.title.toLowerCase().includes(q))
    )
  }, [items, query, status, type])

  function openAdd(): void {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(item: Item): void {
    setEditing(item)
    setDialogOpen(true)
  }

  function closeDialog(): void {
    setDialogOpen(false)
    setEditing(null)
  }

  async function handleSave(input: ItemInput): Promise<void> {
    if (editing) {
      const updated = await api.update(editing.id, input)
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
    } else {
      const created = await api.create(input)
      setItems((prev) => [created, ...prev])
    }
    closeDialog()
  }

  async function handleDelete(): Promise<void> {
    if (!editing) return
    await api.remove(editing.id)
    setItems((prev) => prev.filter((it) => it.id !== editing.id))
    closeDialog()
  }

  async function cycleStatus(item: Item): Promise<void> {
    const updated = await api.update(item.id, { status: nextStatus(item.status) })
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
  }

  const isFiltered = query.trim() !== '' || status !== 'all' || type !== 'all'

  return (
    <div className="min-h-dvh">
      <header className="app-drag sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="flex h-14 items-center gap-4 pl-24 pr-5">
          <h1 className="text-[17px] font-semibold tracking-tight">Queue</h1>
          <div className="app-no-drag relative w-full max-w-xs">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your queue"
              aria-label="Search your queue"
              className="w-full rounded-lg bg-surface py-1.5 pl-9 pr-3 text-sm ring-1 ring-line placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={openAdd}
            className="app-no-drag flex shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-bg transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Add title
          </button>
        </div>
        <div className="app-no-drag flex flex-wrap items-center gap-3 px-5 pb-3">
          <Segmented label="Filter by status" options={STATUS_FILTERS} value={status} onChange={setStatus} />
          <label className="sr-only" htmlFor="type-filter">
            Filter by type
          </label>
          <select
            id="type-filter"
            value={type}
            onChange={(e) => setType(e.target.value as MediaType | 'all')}
            className="rounded-lg bg-surface px-3 py-2 text-[13px] font-medium text-muted ring-1 ring-line transition-colors duration-150 hover:text-ink focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <span className="text-xs text-muted tabular-nums">
            {visible.length} {visible.length === 1 ? 'title' : 'titles'}
          </span>
        </div>
      </header>

      <main className="px-5 pb-10 pt-6">
        {!loaded ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-5 gap-y-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] animate-pulse rounded-xl bg-surface" />
                <div className="mt-2.5 h-4 w-3/4 animate-pulse rounded bg-surface" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-surface ring-1 ring-line">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted">
                <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 9h18M8 4v5M16 4v5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="mt-5 text-base font-semibold">
              {isFiltered ? 'Nothing matches' : 'Your queue is empty'}
            </h2>
            <p className="mt-1.5 max-w-64 text-sm text-muted text-pretty">
              {isFiltered
                ? 'Try a different search or clear your filters.'
                : 'Save the movies and shows you want to watch next.'}
            </p>
            {!isFiltered && (
              <button
                type="button"
                onClick={openAdd}
                className="mt-6 rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-bg transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Add your first title
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-5 gap-y-8">
            {visible.map((item) => (
              <PosterCard key={item.id} item={item} onEdit={openEdit} onCycleStatus={cycleStatus} />
            ))}
          </div>
        )}
      </main>

      <ItemDialog
        open={dialogOpen}
        item={editing}
        onClose={closeDialog}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
