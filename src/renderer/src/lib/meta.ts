import type { MediaType, Status } from '../../../shared/types'

export const TYPE_LABELS: Record<MediaType, string> = {
  movie: 'Movie',
  show: 'TV Show',
  documentary: 'Documentary',
  anime: 'Anime',
  other: 'Other'
}

export const TYPE_ORDER: MediaType[] = ['movie', 'show', 'documentary', 'anime', 'other']

export const STATUS_META: Record<Status, { label: string; dot: string }> = {
  not_watched: { label: 'Not watched', dot: 'bg-zinc-500' },
  watching: { label: 'Watching', dot: 'bg-accent' },
  watched: { label: 'Watched', dot: 'bg-emerald-400' }
}

export const STATUS_ORDER: Status[] = ['not_watched', 'watching', 'watched']

export function nextStatus(s: Status): Status {
  const i = STATUS_ORDER.indexOf(s)
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length]
}

export function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
