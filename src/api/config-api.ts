import { get, put } from './client'
import type { UserConfig } from '@/types/score'
import { DEFAULT_DIMENSIONS } from '@/types/score'

const DEFAULT_CONFIG: UserConfig = {
  targetLocation: null,
  defaultCity: '',
  scoreDimensions: DEFAULT_DIMENSIONS,
}

export async function getConfig(): Promise<UserConfig> {
  try {
    return await get<UserConfig>('/config')
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function saveConfig(config: UserConfig): Promise<void> {
  await put('/config', config)
}
