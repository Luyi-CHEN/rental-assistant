import { useState } from 'react'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { NoteType, NoteSentiment } from '@/types'
import { NOTE_TYPE_LABELS, SENTIMENT_LABELS } from '@/types'

interface AddNoteSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { type: NoteType; content: string; sentiment: NoteSentiment; sourceUrl: string }) => void
}

const NOTE_TYPES: NoteType[] = ['platform_review', 'visit_feeling', 'other']
const SENTIMENTS: { value: NoteSentiment; emoji: string }[] = [
  { value: 'positive', emoji: '👍' },
  { value: 'neutral', emoji: '😐' },
  { value: 'negative', emoji: '👎' },
]

export function AddNoteSheet({ open, onClose, onSubmit }: AddNoteSheetProps) {
  const [type, setType] = useState<NoteType>('platform_review')
  const [content, setContent] = useState('')
  const [sentiment, setSentiment] = useState<NoteSentiment>('neutral')
  const [sourceUrl, setSourceUrl] = useState('')

  const handleSubmit = () => {
    if (!content.trim()) return
    onSubmit({ type, content: content.trim(), sentiment, sourceUrl: sourceUrl.trim() })
    setContent('')
    setSourceUrl('')
    setSentiment('neutral')
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
