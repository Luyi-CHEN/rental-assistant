import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  right?: React.ReactNode
  className?: string
}

export function PageHeader({ title, showBack, right, className }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className={cn("sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border", className)}>
      <div className="flex items-center justify-between h-12 px-4 safe-top">
        <div className="flex items-center gap-2 min-w-[48px]">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="touch-target flex items-center justify-center -ml-2 text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        <div className="flex items-center gap-1 min-w-[48px] justify-end">
          {right}
        </div>
      </div>
    </header>
  )
}
