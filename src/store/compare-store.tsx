import React, { createContext, useContext, useState, useCallback } from 'react'

interface CompareContextValue {
  compareIds: string[]
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  isInCompare: (id: string) => boolean
  canAddMore: boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

const MAX_COMPARE = 4

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([])

  const addToCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      if (prev.length >= MAX_COMPARE || prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const removeFromCompare = useCallback((id: string) => {
    setCompareIds(prev => prev.filter(cid => cid !== id))
  }, [])

  const clearCompare = useCallback(() => setCompareIds([]), [])

  const isInCompare = useCallback((id: string) => compareIds.includes(id), [compareIds])

  return (
    <CompareContext.Provider value={{
      compareIds,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddMore: compareIds.length < MAX_COMPARE,
    }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompareStore() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompareStore must be used within CompareProvider')
  return ctx
}
