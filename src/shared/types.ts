export type MediaType = 'movie' | 'show' | 'documentary' | 'anime' | 'other'
export type Status = 'not_watched' | 'watching' | 'watched'

export interface Item {
  id: number
  title: string
  image: string | null
  type: MediaType
  status: Status
  createdAt: string
  updatedAt: string
}

export interface ItemInput {
  title: string
  image: string | null
  type: MediaType
  status: Status
}

export type ItemPatch = Partial<ItemInput>
