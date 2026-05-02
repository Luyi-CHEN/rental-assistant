export interface ScoreDimension {
  id: string
  name: string
  weight: number
  icon: string
  order: number
}

export interface UserConfig {
  targetLocation: { address: string; lat: number; lng: number } | null
  defaultCity: string
  scoreDimensions: ScoreDimension[]
}

export const DEFAULT_DIMENSIONS: ScoreDimension[] = [
  { id: 'price', name: '价格', weight: 5, icon: 'Wallet', order: 0 },
  { id: 'transport', name: '交通', weight: 4, icon: 'Train', order: 1 },
  { id: 'decoration', name: '装修', weight: 3, icon: 'Paintbrush', order: 2 },
  { id: 'surrounding', name: '周边', weight: 3, icon: 'Store', order: 3 },
  { id: 'safety', name: '安全', weight: 4, icon: 'Shield', order: 4 },
  { id: 'soundproof', name: '隔音', weight: 3, icon: 'Volume2', order: 5 },
]
