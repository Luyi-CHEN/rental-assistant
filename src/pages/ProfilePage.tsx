import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useConfigStore } from '@/store/config-store'
import { useHouseStore } from '@/store/house-store'
import { showToast } from '@/components/ui/toast'
import { getAllHouses } from '@/api/house-api'
import { getAllNotes } from '@/api/note-api'
import { generateId } from '@/lib/utils'
import type { ScoreDimension } from '@/types'
import {
  Download, Upload, Star, Plus, Trash2, GripVertical,
  ChevronRight, Settings
} from 'lucide-react'

export function ProfilePage() {
  const { config, updateDimensions, updateConfig } = useConfigStore()
  const { loadHouses } = useHouseStore()
  const [showDimEditor, setShowDimEditor] = useState(false)
  const [showTargetLocation, setShowTargetLocation] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [editDims, setEditDims] = useState<ScoreDimension[]>([])
  const [targetAddress, setTargetAddress] = useState(config.targetLocation?.address || '')

  // Export data
  const handleExport = async () => {
    try {
      const houses = await getAllHouses()
      const notes = await getAllNotes()
      const exportData = { version: 1, exportDate: new Date().toISOString(), houses, notes, config }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rental-assistant-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('数据导出成功')
    } catch {
      showToast('导出失败', 'error')
    }
  }

  // Import data
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (!data.houses || !Array.isArray(data.houses)) {
          showToast('文件格式不正确', 'error')
          return
        }

        // Import houses
        const { getDB } = await import('@/db/database')
        const db = await getDB()

        const tx = db.transaction(['houses', 'notes'], 'readwrite')
        for (const house of data.houses) {
          await tx.objectStore('houses').put(house)
        }
        if (data.notes) {
          for (const note of data.notes) {
            await tx.objectStore('notes').put(note)
          }
        }
        await tx.done

        if (data.config) {
          await updateConfig(data.config)
        }

        await loadHouses()
        showToast(`导入成功: ${data.houses.length}套房源`)
      } catch {
        showToast('导入失败，请检查文件格式', 'error')
      }
    }
    input.click()
  }

  // Dimension editor
  const openDimEditor = () => {
    setEditDims([...config.scoreDimensions])
    setShowDimEditor(true)
  }

  const addDimension = () => {
    setEditDims(prev => [...prev, {
      id: generateId(),
      name: '',
      weight: 3,
      icon: 'Star',
      order: prev.length,
    }])
  }

  const updateDim = (index: number, updates: Partial<ScoreDimension>) => {
    setEditDims(prev => prev.map((d, i) => i === index ? { ...d, ...updates } : d))
  }

  const removeDim = (index: number) => {
    setEditDims(prev => prev.filter((_, i) => i !== index))
  }

  const saveDimensions = async () => {
    const validDims = editDims.filter(d => d.name.trim())
    if (validDims.length < 3) {
      showToast('至少需要3个评分维度', 'error')
      return
    }
    await updateDimensions(validDims.map((d, i) => ({ ...d, order: i })))
    setShowDimEditor(false)
    showToast('评分维度已更新')
  }

  const handleSaveTarget = async () => {
    if (targetAddress.trim()) {
      await updateConfig({
        targetLocation: { address: targetAddress.trim(), lat: 0, lng: 0 }
      })
      showToast('目标地点已保存')
    } else {
      await updateConfig({ targetLocation: null })
      showToast('目标地点已清除')
    }
    setShowTargetLocation(false)
  }

  return (
    <div className="pb-nav">
      <PageHeader title="我的" />

      <div className="px-4 py-4 space-y-6">
        {/* Settings section */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">设置</h3>

          <button
            onClick={openDimEditor}
            className="flex items-center justify-between w-full p-3.5 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">评分维度管理</div>
                <div className="text-xs text-muted-foreground">{config.scoreDimensions.length}个维度</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => { setTargetAddress(config.targetLocation?.address || ''); setShowTargetLocation(true) }}
            className="flex items-center justify-between w-full p-3.5 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">目标地点</div>
                <div className="text-xs text-muted-foreground">
                  {config.targetLocation?.address || '设置公司/学校地址'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Data section */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">数据管理</h3>

          <button
            onClick={handleExport}
            className="flex items-center justify-between w-full p-3.5 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <Download className="w-4.5 h-4.5 text-success" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">导出数据</div>
                <div className="text-xs text-muted-foreground">导出为JSON文件备份</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => setShowImportConfirm(true)}
            className="flex items-center justify-between w-full p-3.5 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Upload className="w-4.5 h-4.5 text-warning-foreground" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">导入数据</div>
                <div className="text-xs text-muted-foreground">从JSON文件恢复</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* About */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">租房助手 v0.1.0</p>
          <p className="text-xs text-muted-foreground mt-0.5">数据存储在本地浏览器中</p>
        </div>
      </div>

      {/* Dimension editor sheet */}
      <BottomSheet open={showDimEditor} onClose={() => setShowDimEditor(false)} title="评分维度管理">
        <div className="space-y-3">
          {editDims.map((dim, idx) => (
            <div key={dim.id} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={dim.name}
                onChange={e => updateDim(idx, { name: e.target.value })}
                placeholder="维度名称"
                className="flex-1 h-9"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">权重</span>
                <select
                  value={dim.weight}
                  onChange={e => updateDim(idx, { weight: parseInt(e.target.value) })}
                  className="h-9 px-2 rounded-md border border-input bg-card text-sm"
                >
                  {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <button onClick={() => removeDim(idx)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={addDimension}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加维度
          </button>

          <Button onClick={saveDimensions} className="w-full">
            保存
          </Button>
        </div>
      </BottomSheet>

      {/* Target location sheet */}
      <BottomSheet open={showTargetLocation} onClose={() => setShowTargetLocation(false)} title="设置目标地点">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">设置你的公司或学校地址，方便计算通勤距离</p>
          <Input
            placeholder="如: 北京市朝阳区望京SOHO"
            value={targetAddress}
            onChange={e => setTargetAddress(e.target.value)}
          />
          <Button onClick={handleSaveTarget} className="w-full">
            保存
          </Button>
        </div>
      </BottomSheet>

      {/* Import confirm */}
      <ConfirmDialog
        open={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        onConfirm={handleImport}
        title="导入数据"
        description="导入将与现有数据合并，重复ID的房源将被覆盖"
        confirmText="选择文件"
      />
    </div>
  )
}
