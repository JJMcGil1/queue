import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import type { Item, ItemInput, ItemPatch } from '../shared/types'

let db: Database.Database

interface Row {
  id: number
  title: string
  image: string | null
  type: Item['type']
  status: Item['status']
  created_at: string
  updated_at: string
}

const toItem = (r: Row): Item => ({
  id: r.id,
  title: r.title,
  image: r.image,
  type: r.type,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at
})

export function initDb(): void {
  db = new Database(join(app.getPath('userData'), 'queue.db'))
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT,
      type TEXT NOT NULL DEFAULT 'movie',
      status TEXT NOT NULL DEFAULT 'not_watched',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

export function listItems(): Item[] {
  const rows = db.prepare('SELECT * FROM items ORDER BY created_at DESC, id DESC').all() as Row[]
  return rows.map(toItem)
}

export function createItem(input: ItemInput): Item {
  const result = db
    .prepare('INSERT INTO items (title, image, type, status) VALUES (?, ?, ?, ?)')
    .run(input.title, input.image, input.type, input.status)
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid) as Row
  return toItem(row)
}

export function updateItem(id: number, patch: ItemPatch): Item {
  const fields: string[] = []
  const values: unknown[] = []
  if (patch.title !== undefined) {
    fields.push('title = ?')
    values.push(patch.title)
  }
  if (patch.image !== undefined) {
    fields.push('image = ?')
    values.push(patch.image)
  }
  if (patch.type !== undefined) {
    fields.push('type = ?')
    values.push(patch.type)
  }
  if (patch.status !== undefined) {
    fields.push('status = ?')
    values.push(patch.status)
  }
  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')")
    db.prepare(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`).run(...values, id)
  }
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Row
  return toItem(row)
}

export function deleteItem(id: number): void {
  db.prepare('DELETE FROM items WHERE id = ?').run(id)
}
