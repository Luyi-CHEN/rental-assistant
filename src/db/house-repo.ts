import { getDB } from './database'
import type { House, HouseStatus } from '@/types/house'
import { generateId } from '@/lib/utils'

export async function getAllHouses(): Promise<House[]> {
  const db = await getDB()
  const houses = await db.getAll('houses')
  return houses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getHouseById(id: string): Promise<House | undefined> {
  const db = await getDB()
  return db.get('houses', id)
}

export async function addHouse(house: Omit<House, 'id' | 'createdAt' | 'updatedAt' | 'weightedScore'>): Promise<House> {
  const db = await getDB()
  const now = new Date().toISOString()
  const newHouse: House = {
    ...house,
    id: generateId(),
    weightedScore: 0,
    createdAt: now,
    updatedAt: now,
  }
  await db.put('houses', newHouse)
  return newHouse
}

export async function updateHouse(id: string, updates: Partial<House>): Promise<House | undefined> {
  const db = await getDB()
  const house = await db.get('houses', id)
  if (!house) return undefined
  
  const updated: House = {
    ...house,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  }
  await db.put('houses', updated)
  return updated
}

export async function updateHouseStatus(id: string, status: HouseStatus): Promise<House | undefined> {
  return updateHouse(id, { status })
}

export async function deleteHouse(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('houses', id)
  // Also delete associated notes
  const notes = await db.getAllFromIndex('notes', 'by-house', id)
  const tx = db.transaction('notes', 'readwrite')
  await Promise.all(notes.map(n => tx.store.delete(n.id)))
  await tx.done
}

export async function getHousesByStatus(status: HouseStatus): Promise<House[]> {
  const db = await getDB()
  const houses = await db.getAllFromIndex('houses', 'by-status', status)
  return houses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
