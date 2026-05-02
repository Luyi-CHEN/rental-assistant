import { getDB } from './database'
import type { UserConfig } from '@/types/score'
import { DEFAULT_DIMENSIONS } from '@/types/score'

const CONFIG_KEY = 'user-config'

export async function getConfig(): Promise<UserConfig> {
  const db = await getDB()
  const config = await db.get('config', CONFIG_KEY)
  if (config) return config
  
  const defaultConfig: UserConfig = {
    targetLocation: null,
    defaultCity: '',
    scoreDimensions: DEFAULT_DIMENSIONS,
  }
  return defaultConfig
}

export async function saveConfig(config: UserConfig): Promise<void> {
  const db = await getDB()
  await db.put('config', { ...config, id: CONFIG_KEY } as never)
}
