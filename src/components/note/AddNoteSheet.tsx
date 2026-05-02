import { useState, useRef } from 'react'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn, generateId } from '@/lib/utils'
import type { NoteType, NoteSentiment, NoteImage } from '@/types'
import { NOTE_TYPE_LABELS, SENTIMENT_LABELS } from '@/types'
import { ImagePlus, X } from 'lucide-react'

interface AddNoteSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { type: NoteType; content: string; sentiment: NoteSentiment; sourceUrl: string; images?: NoteImage[] }) => void
}

const NOTE_TYPES: NoteType[] = ['platform_review', 'visit_feeling', 'other']
const SENTIMENTS: { value: NoteSentiment; emoji: string }[] = [
  { value: 'positive', emoji: '👍' },
  { value: 'neutral', emoji: '😐' },
  { value: 'negative', emoji: '👎' },
]

function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AddNoteSheet({ open, onClose, onSubmit }: AddNoteSheetProps) {
  const [type, setType] = useState<NoteType>('platform_review')
  const [content, setContent] = useState('')
  const [sentiment, setSentiment] = useState<NoteSentiment>('neutral')
  const [sourceUrl, setSourceUrl] = useState('')
  const [images, setImages] = useState<NoteImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remainingSlots = 5 - images.length
    if (remainingSlots <= 0) return
    const filesToProcess = Array.from(files).slice(0, remainingSlots)
    const newImages: NoteImage[] = []
    for (const file of filesToProcess) {
      try {
        const dataUrl = await compressImage(file)
        newImages.push({
          id: generateId(),
          dataUrl,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        })
      } catch {
        // 忽略压缩失败的图片
      }
    }
    setImages(prev => [...prev, ...newImages])
    e.target.value = ''
  }

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const handleSubmit = () => {
    if (!content.trim()) return
    onSubmit({ type, content: content.trim(), sentiment, sourceUrl: sourceUrl.trim(), images: images.length > 0 ? images : undefined })
    setContent('')
    setSourceUrl('')
    setSentiment('neutral')
    setImages([])
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="添加笔记">
      <div className="space-y-4">
        {/* Note type */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">笔记类型</label>
          <div className="flex gap-2">
            {NOTE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                {NOTE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">笔记内容</label>
          <Textarea
            placeholder="记录你的发现或感受..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            autoFocus
          />
        </div>

        {/* Sentiment */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">情感倾向</label>
          <div className="flex gap-2">
            {SENTIMENTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSentiment(s.value)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                  sentiment === s.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <span>{s.emoji}</span>
                <span>{SENTIMENT_LABELS[s.value]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">截图 ({images.length}/5)</label>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map(img => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                  <img src={img.dataUrl} alt={img.fileName || '截图'} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="text-sm">添加截图</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Source URL */}
        {type === 'platform_review' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">来源链接 (可选)</label>
            <Input
              placeholder="如小红书帖子链接"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
            />
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full" disabled={!content.trim()}>
          保存笔记
        </Button>
      </div>
    </BottomSheet>
  )
}
