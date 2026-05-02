import { getDB } from './database'
import type { Note } from '@/types/note'
import { generateId } from '@/lib/utils'

export async function getNotesByHouseId(houseId: string): Promise<Note[]> {
  const db = await getDB()
  const notes = await db.getAllFromIndex('notes', 'by-house', houseId)
  return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function addNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
  const db = await getDB()
  const newNote: Note = {
    ...note,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  await db.put('notes', newNote)
  return newNote
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('notes', id)
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB()
  return db.getAll('notes')
}
