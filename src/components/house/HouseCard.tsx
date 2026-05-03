import { useNavigate } from 'react-router-dom'
import { MapPin, StickyNote, Star } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/types'
import type { House } from '@/types'

const PLATFORM_COLORS: Record<string, string> = {
  lianjia: 'bg-platform-lianjia',
  beike: 'bg-platform-beike',
  ziroom: 'bg-platform-ziroom',
  anjuke: 'bg-platform-anjuke',
  xiaohongshu: 'bg-platform-xiaohongshu',
  woaiwojia: 'bg-primary',
  douban: 'bg-platform-lianjia',
  other: 'bg-muted-foreground',
}

const STATUS_VARIANTS: Record<string, string> = {
  collecting: 'bg-primary/10 text-primary',
  visited: 'bg-warning/10 text-warning-foreground',
  eliminated: 'bg-muted text-muted-foreground',
  pending_sign: 'bg-success/10 text-success',
  signed: 'bg-success/10 text-success',
}

interface HouseCardProps {
  house: House
  noteCount?: number
  onAddNote?: () => void
  className?: string
}

export function HouseCard({ house, noteCount = 0, className }: HouseCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border shadow-card card-press cursor-pointer overflow-hidden",
        className
      )}
      onClick={() => navigate(`/house/${house.id}`)}
    >
      <div className="p-4">
        {/* Top row: platform + status + score */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="platform" className={cn("text-2xs px-2 py-0.5", PLATFORM_COLORS[house.sourcePlatform])}>
              {PLATFORM_LABELS[house.sourcePlatform]}
            </Badge>
            <Badge className={cn("text-2xs", STATUS_VARIANTS[house.status])}>
              {STATUS_LABELS[house.status]}
            </Badge>
          </div>
          {house.weightedScore > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-3.5 h-3.5 fill-primary" />
              <span className="text-sm font-semibold">{house.weightedScore}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-foreground mb-1 truncate">
          {house.name}
        </h3>

        {/* Location */}
        {(house.district || house.address) && (
          <div className="flex items-center gap-1 text-muted-foreground mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs truncate">
              {[house.district, house.address].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}

        {/* Info row */}
        <div className="flex items-baseline justify-between mb-2.5">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-primary">{formatPrice(house.rent)}</span>
            <span className="text-xs text-muted-foreground">/月</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {house.layout && <span>{house.layout}</span>}
            {house.area && <span>{house.area}㎡</span>}
            {house.buildingType && <span>{house.buildingType}</span>}
            {house.floor && <span>{house.floor}</span>}
          </div>
        </div>

        {/* Bottom: tags + note count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
            {house.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-2xs shrink-0">
                {tag}
              </Badge>
            ))}
            {house.tags.length > 3 && (
              <span className="text-2xs text-muted-foreground">+{house.tags.length - 3}</span>
            )}
          </div>
          {noteCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground ml-2">
              <StickyNote className="w-3.5 h-3.5" />
              <span className="text-xs">{noteCount}条笔记</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
