import { get, post, put, del } from './client'
import type { House, HouseStatus } from '@/types/house'

export async function getAllHouses(): Promise<House[]> {
  return get<House[]>('/houses')
}

export async function getHouseById(id: string): Promise<House | undefined> {
  try {
    return await get<House>(`/houses/${id}`)
  } catch {
    return undefined
  }
}

export async function addHouse(house: Omit<House, 'id' | 'createdAt' | 'updatedAt' | 'weightedScore'>): Promise<House> {
  return post<House>('/houses', house)
}

export async function updateHouse(id: string, updates: Partial<House>): Promise<House | undefined> {
  try {
    return await put<House>(`/houses/${id}`, updates)
  } catch {
    return undefined
  }
}

export async function updateHouseStatus(id: string, status: HouseStatus): Promise<House | undefined> {
  return updateHouse(id, { status })
}

export async function deleteHouse(id: string): Promise<void> {
  await del(`/houses/${id}`)
}

export async function getHousesByStatus(status: HouseStatus): Promise<House[]> {
  const houses = await getAllHouses()
  return houses.filter(h => h.status === status)
}
