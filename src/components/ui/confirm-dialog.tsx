import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-sheet w-full max-w-[320px] animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
        </div>
        <div className="flex border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            {cancelText}
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold transition-colors",
              variant === 'destructive' ? 'text-destructive hover:bg-destructive/5' : 'text-primary hover:bg-primary/5'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
