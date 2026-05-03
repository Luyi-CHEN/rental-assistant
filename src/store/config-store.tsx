import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { UserConfig, ScoreDimension } from '@/types'
import { DEFAULT_DIMENSIONS } from '@/types'
import * as configRepo from '@/api/config-api'

interface ConfigContextValue {
  config: UserConfig
  loading: boolean
  updateConfig: (updates: Partial<UserConfig>) => Promise<void>
  updateDimensions: (dims: ScoreDimension[]) => Promise<void>
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<UserConfig>({
    targetLocation: null,
    defaultCity: '',
    scoreDimensions: DEFAULT_DIMENSIONS,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    configRepo.getConfig().then(c => {
      setConfig(c)
      setLoading(false)
    })
  }, [])

  const updateConfig = useCallback(async (updates: Partial<UserConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    await configRepo.saveConfig(newConfig)
  }, [config])

  const updateDimensions = useCallback(async (dims: ScoreDimension[]) => {
    await updateConfig({ scoreDimensions: dims })
  }, [updateConfig])

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig, updateDimensions }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfigStore() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfigStore must be used within ConfigProvider')
  return ctx
}
