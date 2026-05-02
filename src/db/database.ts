import { openDB, type IDBPDatabase } from 'idb'
import type { House } from '@/types/house'
import type { Note } from '@/types/note'
import type { UserConfig } from '@/types/score'

export interface RentalDB {
  houses: {
    key: string
    value: House
    indexes: {
      'by-status': string
      'by-created': string
    }
  }
  notes: {
    key: string
    value: Note
    indexes: {
      'by-house': string
      'by-created': string
    }
  }
  config: {
    key: string
    value: UserConfig
  }
}

let dbPromise: Promise<IDBPDatabase<RentalDB>> | null = null

export function getDB(): Promise<IDBPDatabase<RentalDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RentalDB>('RentalAssistantDB', 1, {
      upgrade(db) {
        const houseStore = db.createObjectStore('houses', { keyPath: 'id' })
        houseStore.createIndex('by-status', 'status')
        houseStore.createIndex('by-created', 'createdAt')

        const noteStore = db.createObjectStore('notes', { keyPath: 'id' })
        noteStore.createIndex('by-house', 'houseId')
        noteStore.createIndex('by-created', 'createdAt')

        db.createObjectStore('config', { keyPath: 'id' as never })
      },
    })
  }
  return dbPromise
}
