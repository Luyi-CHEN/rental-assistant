import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ScoreDimension } from '@/types'
import { Star } from 'lucide-react'

interface ScoreEditorProps {
  open: boolean
  onClose: () => void
  dimensions: ScoreDimension[]
  scores: Record<string, number>
  onSave: (scores: Record<string, number>) => void
}

export function ScoreEditor({ open, onClose, dimensions, scores, onSave }: ScoreEditorProps) {
  const localScores = { ...scores }

  const setScore = (dimId: string, value: number) => {
    localScores[dimId] = localScores[dimId] === value ? 0 : value
    // Force re-render by triggering onSave immediately for responsive feel
    onSave({ ...localScores })
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="给房源打分">
      <div className="space-y-5">
        {dimensions.map(dim => (
          <div key={dim.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{dim.name}</span>
              <span className="text-xs text-muted-foreground">
                权重 {'★'.repeat(dim.weight)}{'☆'.repeat(5 - dim.weight)}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  onClick={() => setScore(dim.id, value)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={cn(
                      "w-7 h-7 transition-colors",
                      (scores[dim.id] || 0) >= value
                        ? "fill-primary text-primary"
                        : "text-border"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground self-center">
                {scores[dim.id] || '-'}
              </span>
            </div>
          </div>
        ))}

        <Button onClick={onClose} className="w-full">
          完成
        </Button>
      </div>
    </BottomSheet>
  )
}
