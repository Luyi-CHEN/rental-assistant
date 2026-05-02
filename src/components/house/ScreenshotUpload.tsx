import { useState, useRef } from 'react'
import { Camera, ImagePlus, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { recognizeImage, type OcrProgress, type OcrResult } from '@/lib/ocr-parser'
import type { ParsedLink } from '@/lib/url-parser'
import { PLATFORM_LABELS } from '@/types'

interface ScreenshotUploadProps {
  onResult: (parsed: ParsedLink) => void
}

export function ScreenshotUpload({ onResult }: ScreenshotUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState<OcrProgress | null>(null)
  const [result, setResult] = useState<OcrResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRawText, setShowRawText] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('图片文件不能超过10MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Reset state
    setError(null)
    setResult(null)
    setShowRawText(false)

    // Start OCR
    try {
      const ocrResult = await recognizeImage(file, setProgress)
      setResult(ocrResult)
      setProgress({ status: 'done', progress: 1, message: '识别完成' })
    } catch (err) {
      setError('识别失败，请重试或手动录入')
      setProgress(null)
    }
  }

  const handleUseResult = () => {
    if (result) {
      onResult(result.parsed)
    }
  }

  const isProcessing = progress?.status === 'loading' || progress?.status === 'recognizing'
  const isDone = progress?.status === 'done'

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {!preview && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            上传房源截图，自动识别文字提取房源信息
          </p>

          {/* File input buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture')
                  fileInputRef.current.click()
                }
              }}
              className="flex-1 flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-accent/50 transition-all"
            >
              <ImagePlus className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-foreground">从相册选择</span>
              <span className="text-2xs text-muted-foreground">选择已保存的截图</span>
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment')
                  fileInputRef.current.click()
                }
              }}
              className="flex-1 flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-accent/50 transition-all"
            >
              <Camera className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-foreground">拍照识别</span>
              <span className="text-2xs text-muted-foreground">直接拍摄房源信息</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Preview + Progress */}
      {preview && (
        <div className="space-y-3">
          {/* Image preview */}
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={preview}
              alt="房源截图"
              className={cn(
                "w-full max-h-[240px] object-contain bg-secondary/30",
                isProcessing && "opacity-60"
              )}
            />

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 backdrop-blur-[2px]">
                <div className="bg-card rounded-xl px-5 py-4 shadow-card-hover text-center">
                  <Loader2 className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
                  <p className="text-sm font-medium text-foreground">{progress?.message}</p>
                  <div className="w-40 h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${(progress?.progress ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Re-upload button */}
          <button
            onClick={() => {
              setPreview(null)
              setResult(null)
              setProgress(null)
              setError(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="text-xs text-primary font-medium"
            disabled={isProcessing}
          >
            重新选择图片
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* OCR Result */}
      {isDone && result && (
        <div className="space-y-3 animate-fade-in">
          {/* Success indicator */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle className="w-4 h-4 text-success shrink-0" />
            <span className="text-sm text-success">识别完成，已提取到以下信息</span>
          </div>

          {/* Parsed fields preview */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            {result.parsed.platform !== 'other' && (
              <InfoRow label="来源平台" value={PLATFORM_LABELS[result.parsed.platform]} />
            )}
            {result.parsed.name && <InfoRow label="小区名称" value={result.parsed.name} />}
            {result.parsed.rent && <InfoRow label="月租金" value={`¥${result.parsed.rent}`} />}
            {result.parsed.area && <InfoRow label="面积" value={`${result.parsed.area}㎡`} />}
            {result.parsed.layout && <InfoRow label="户型" value={result.parsed.layout} />}
            {result.parsed.floor && <InfoRow label="楼层" value={result.parsed.floor} />}
            {result.parsed.orientation && <InfoRow label="朝向" value={result.parsed.orientation} />}

            {!result.parsed.name && !result.parsed.rent && !result.parsed.area && (
              <p className="text-sm text-muted-foreground text-center py-2">
                未能自动提取到关键信息，请手动填写
              </p>
            )}
          </div>

          {/* Raw OCR text (collapsible) */}
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="flex items-center gap-1 text-xs text-muted-foreground font-medium"
          >
            {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            查看原始识别文字
          </button>
          {showRawText && (
            <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 max-h-[160px] overflow-y-auto whitespace-pre-wrap break-all">
              {result.rawText || '(无识别文字)'}
            </pre>
          )}

          {/* Action button */}
          <Button onClick={handleUseResult} className="w-full">
            使用识别结果，继续填写
          </Button>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
