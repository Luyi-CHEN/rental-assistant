import { ThumbsUp, Minus, ThumbsDown, ExternalLink, Trash2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { NOTE_TYPE_LABELS } from '@/types'
import type { Note } from '@/types'

interface NoteTimelineProps {
  notes: Note[]
  onDelete?: (id: string) => void
}

const SENTIMENT_CONFIG = {
  positive: { icon: ThumbsUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' },
  negative: { icon: ThumbsDown, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
}

export function NoteTimeline({ notes, onDelete }: NoteTimelineProps) {
  if (notes.length === 0) return null

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const config = SENTIMENT_CONFIG[note.sentiment]
        const Icon = config.icon

        return (
          <div
            key={note.id}
            className={cn("relative p-3.5 rounded-xl border", config.border, config.bg)}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", config.color)} />
                <span className="text-xs font-medium text-muted-foreground">
                  {NOTE_TYPE_LABELS[note.type]}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
            {note.sourceUrl && (
              <a
                href={note.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-primary"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                查看来源
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
