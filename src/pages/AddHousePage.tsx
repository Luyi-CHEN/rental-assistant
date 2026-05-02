import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { HouseForm } from '@/components/house/HouseForm'
import { ScreenshotUpload } from '@/components/house/ScreenshotUpload'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useHouseStore } from '@/store/house-store'
import { showToast } from '@/components/ui/toast'
import { parseShareText, isValidUrl } from '@/lib/url-parser'
import type { ParsedLink } from '@/lib/url-parser'
import { Link2, Camera, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { House } from '@/types'

type Mode = 'link' | 'screenshot' | 'manual'

export function AddHousePage() {
  const navigate = useNavigate()
  const { addHouse } = useHouseStore()
  const [mode, setMode] = useState<Mode>('link')
  const [linkText, setLinkText] = useState('')
  const [parsedData, setParsedData] = useState<Partial<House> | null>(null)

  const handleParseLink = () => {
    if (!linkText.trim()) return

    const parsed = parseShareText(linkText)
    if (parsed) {
      applyParsedResult(parsed)
      showToast('识别成功，请补充信息', 'success')
    } else if (isValidUrl(linkText.trim())) {
      setParsedData({ sourceUrl: linkText.trim() })
      showToast('已保存链接，请手动填写信息', 'info')
    } else {
      showToast('未识别到已知平台，请尝试手动录入', 'error')
    }
  }

  const applyParsedResult = (parsed: ParsedLink) => {
    setParsedData({
      name: parsed.name || '',
      rent: parsed.rent || 0,
      area: parsed.area || null,
      layout: parsed.layout || '',
      floor: parsed.floor || '',
      orientation: parsed.orientation || '',
      sourcePlatform: parsed.platform,
      sourceUrl: parsed.sourceUrl,
    })
  }

  const handleScreenshotResult = (parsed: ParsedLink) => {
    applyParsedResult(parsed)
    showToast('已提取房源信息，请补充完善', 'success')
  }

  const handleSubmit = async (data: Omit<House, 'id' | 'createdAt' | 'updatedAt' | 'weightedScore'>) => {
    try {
      await addHouse(data)
      showToast('房源已添加')
      navigate('/')
    } catch {
      showToast('保存失败，请重试', 'error')
    }
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setParsedData(null)
  }

  return (
    <div className="pb-24">
      <PageHeader title="添加房源" showBack />

      {/* Mode toggle - 3 columns */}
      <div className="flex gap-2 px-4 py-3">
        <ModeButton
          active={mode === 'link'}
          onClick={() => switchMode('link')}
          icon={<Link2 className="w-4 h-4" />}
          label="粘贴链接"
          desc="链接/分享文字"
        />
        <ModeButton
          active={mode === 'screenshot'}
          onClick={() => switchMode('screenshot')}
          icon={<Camera className="w-4 h-4" />}
          label="截图识别"
          desc="上传截图OCR"
        />
        <ModeButton
          active={mode === 'manual'}
          onClick={() => switchMode('manual')}
          icon={<PenLine className="w-4 h-4" />}
          label="手动录入"
          desc="填写信息"
        />
      </div>

      <div className="px-4">
        {/* Link mode */}
        {mode === 'link' && !parsedData && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              粘贴房源链接、微信分享文字或小程序链接，自动识别平台
            </p>
            <Textarea
              placeholder={"粘贴链接或分享文字...\n\n支持: 网页链接 / 微信小程序链接 / 含平台名文字"}
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              rows={4}
            />
            <Button onClick={handleParseLink} className="w-full" disabled={!linkText.trim()}>
              识别并导入
            </Button>
          </div>
        )}

        {/* Screenshot mode */}
        {mode === 'screenshot' && !parsedData && (
          <ScreenshotUpload onResult={handleScreenshotResult} />
        )}

        {/* Manual mode or after parse/screenshot result */}
        {(mode === 'manual' || parsedData) && (
          <HouseForm
            initialData={parsedData || undefined}
            onSubmit={handleSubmit}
            submitLabel="添加房源"
          />
        )}
      </div>
    </div>
  )
}

function ModeButton({
  active, onClick, icon, label, desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 flex-1 px-2 py-3 rounded-xl border transition-all text-center",
        active
          ? "border-primary bg-accent text-primary"
          : "border-border bg-card text-muted-foreground"
      )}
    >
      {icon}
      <div className="text-xs font-medium">{label}</div>
      <div className="text-2xs opacity-70">{desc}</div>
    </button>
  )
}
