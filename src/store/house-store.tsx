import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { House, HouseStatus } from '@/types'
import * as houseRepo from '@/api/house-api'

interface HouseState {
  houses: House[]
  loading: boolean
  initialized: boolean
}

type HouseAction =
  | { type: 'SET_HOUSES'; payload: House[] }
  | { type: 'ADD_HOUSE'; payload: House }
  | { type: 'UPDATE_HOUSE'; payload: House }
  | { type: 'DELETE_HOUSE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }

function houseReducer(state: HouseState, action: HouseAction): HouseState {
  switch (action.type) {
    case 'SET_HOUSES':
      return { ...state, houses: action.payload, loading: false, initialized: true }
    case 'ADD_HOUSE':
      return { ...state, houses: [action.payload, ...state.houses] }
    case 'UPDATE_HOUSE':
      return {
        ...state,
        houses: state.houses.map(h => h.id === action.payload.id ? action.payload : h),
      }
    case 'DELETE_HOUSE':
      return { ...state, houses: state.houses.filter(h => h.id !== action.payload) }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

interface HouseContextValue {
  state: HouseState
  loadHouses: () => Promise<void>
  addHouse: (house: Omit<House, 'id' | 'createdAt' | 'updatedAt' | 'weightedScore'>) => Promise<House>
  updateHouse: (id: string, updates: Partial<House>) => Promise<void>
  updateStatus: (id: string, status: HouseStatus) => Promise<void>
  removeHouse: (id: string) => Promise<void>
}

const HouseContext = createContext<HouseContextValue | null>(null)

export function HouseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(houseReducer, {
    houses: [],
    loading: true,
    initialized: false,
  })

  const loadHouses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const houses = await houseRepo.getAllHouses()
    dispatch({ type: 'SET_HOUSES', payload: houses })
  }, [])

  const addHouse = useCallback(async (house: Omit<House, 'id' | 'createdAt' | 'updatedAt' | 'weightedScore'>) => {
    const newHouse = await houseRepo.addHouse(house)
    dispatch({ type: 'ADD_HOUSE', payload: newHouse })
    return newHouse
  }, [])

  const updateHouse = useCallback(async (id: string, updates: Partial<House>) => {
    const updated = await houseRepo.updateHouse(id, updates)
    if (updated) dispatch({ type: 'UPDATE_HOUSE', payload: updated })
  }, [])

  const updateStatus = useCallback(async (id: string, status: HouseStatus) => {
    const updated = await houseRepo.updateHouseStatus(id, status)
    if (updated) dispatch({ type: 'UPDATE_HOUSE', payload: updated })
  }, [])

  const removeHouse = useCallback(async (id: string) => {
    await houseRepo.deleteHouse(id)
    dispatch({ type: 'DELETE_HOUSE', payload: id })
  }, [])

  useEffect(() => {
    loadHouses()
  }, [loadHouses])

  return (
    <HouseContext.Provider value={{ state, loadHouses, addHouse, updateHouse, updateStatus, removeHouse }}>
      {children}
    </HouseContext.Provider>
  )
}

export function useHouseStore() {
  const ctx = useContext(HouseContext)
  if (!ctx) throw new Error('useHouseStore must be used within HouseProvider')
  return ctx
}
