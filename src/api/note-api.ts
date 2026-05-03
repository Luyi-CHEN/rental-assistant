import { get, post, del } from './client'
import type { Note } from '@/types/note'

export async function getNotesByHouseId(houseId: string): Promise<Note[]> {
  return get<Note[]>(`/houses/${houseId}/notes`)
}

export async function addNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
  const { houseId, ...body } = note
  return post<Note>(`/houses/${houseId}/notes`, body)
}

export async function deleteNote(id: string): Promise<void> {
  await del(`/notes/${id}`)
}

export async function getAllNotes(): Promise<Note[]> {
  // For export functionality - get all notes
  // The backend doesn't have a dedicated endpoint for this yet,
  // but we can use the houses list to fetch all notes
  return get<Note[]>('/notes')
}
