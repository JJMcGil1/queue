import { useEffect, useRef, useState } from 'react'
import type { Item, ItemInput, MediaType, Status } from '../../../shared/types'
import { TYPE_LABELS, TYPE_ORDER, STATUS_META, STATUS_ORDER, initials } from '../lib/meta'
import { cx } from '../lib/cx'
import { Segmented } from './Segmented'

const MAX_POSTER_WIDTH = 640

async function fileToPosterDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('unreadable image'))
      img.src = url
    })
    const scale = Math.min(1, MAX_POSTER_WIDTH / img.naturalWidth)
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#151517'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}

interface Props {
  open: boolean
  item: Item | null
  onClose: () => void
  onSave: (input: ItemInput) => void
  onDelete: () => void
}

export function ItemDialog({ open, item, onClose, onSave, onDelete }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [type, setType] = useState<MediaType>('movie')
  const [status, setStatus] = useState<Status>('not_watched')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [broken, setBroken] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open) {
      setTitle(item?.title ?? '')
      setImage(item?.image ?? '')
      setType(item?.type ?? 'movie')
      setStatus(item?.status ?? 'not_watched')
      setConfirmDelete(false)
      setBroken(false)
      setDragOver(false)
      setImageError(null)
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open, item])

  useEffect(() => setBroken(false), [image])

  const trimmed = title.trim()
  const previewImage = image.trim()
  const isUpload = previewImage.startsWith('data:')

  async function handleFile(file: File | undefined): Promise<void> {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('That file is not an image.')
      return
    }
    try {
      setImage(await fileToPosterDataUrl(file))
      setImageError(null)
    } catch {
      setImageError("Couldn't read that image. Try a JPG or PNG.")
    }
  }

  function pickFile(): void {
    fileRef.current?.click()
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!trimmed) return
    onSave({ title: trimmed, image: previewImage || null, type, status })
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[620px] max-w-[calc(100vw-48px)] rounded-2xl bg-raised p-0 text-ink shadow-2xl ring-1 ring-white/10"
    >
      <form onSubmit={handleSubmit} className="flex gap-6 p-6">
        <div className="hidden w-44 shrink-0 sm:block">
          <button
            type="button"
            onClick={pickFile}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              void handleFile(e.dataTransfer.files[0])
            }}
            aria-label="Upload poster image"
            className={cx(
              'group relative block w-full overflow-hidden rounded-xl bg-surface ring-1 transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
              dragOver ? 'ring-2 ring-accent' : 'ring-line'
            )}
          >
            <div className="aspect-[2/3]">
              {previewImage && !broken ? (
                <img
                  src={previewImage}
                  alt=""
                  onError={() => setBroken(true)}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 text-muted">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                  {trimmed ? (
                    <span className="select-none text-2xl font-semibold text-white/10">
                      {initials(trimmed)}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-black/55 py-2.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="text-xs font-medium">
                {previewImage ? 'Replace poster' : 'Upload poster'}
              </span>
            </div>
          </button>
          <p className="mt-2 text-center text-xs text-muted">Click or drop an image</p>
        </div>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              {item ? 'Edit title' : 'Add to queue'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="mt-5 space-y-5">
            <div>
              <label htmlFor="item-title" className="mb-1.5 block text-[13px] font-medium text-muted">
                Title
              </label>
              <input
                id="item-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dune: Part Two"
                autoFocus
                className="w-full rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-line placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-muted">
                Poster <span className="font-normal text-muted/70">(optional)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={pickFile}
                  className="shrink-0 rounded-lg bg-surface px-3 py-2 text-[13px] font-medium ring-1 ring-line transition-colors duration-150 hover:bg-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Upload image
                </button>
                {isUpload ? (
                  <>
                    <span className="text-xs text-muted">Poster uploaded</span>
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="rounded px-1 text-xs text-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="or paste an image URL"
                    aria-label="Poster image URL"
                    spellCheck={false}
                    className="w-full min-w-0 flex-1 rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-line placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                )}
              </div>
              {imageError && <p className="mt-1.5 text-xs text-red-400">{imageError}</p>}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </div>

            <fieldset>
              <legend className="mb-1.5 block text-[13px] font-medium text-muted">Type</legend>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_ORDER.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={type === t}
                    onClick={() => setType(t)}
                    className={cx(
                      'rounded-full px-3 py-1.5 text-[13px] font-medium ring-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                      type === t
                        ? 'bg-ink text-bg ring-ink'
                        : 'bg-surface text-muted ring-line hover:text-ink'
                    )}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 block text-[13px] font-medium text-muted">Status</legend>
              <Segmented
                label="Status"
                options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label }))}
                value={status}
                onChange={setStatus}
              />
            </fieldset>
          </div>

          <footer className="mt-7 flex items-center gap-2">
            {item &&
              (confirmDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg bg-red-500/15 px-3 py-2 text-[13px] font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Delete
                </button>
              ))}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!trimmed}
              className="rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-bg transition-colors duration-150 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {item ? 'Save changes' : 'Add to queue'}
            </button>
          </footer>
        </div>
      </form>
    </dialog>
  )
}
