import { cn } from '@/lib/utils'
import type { HouseStatus, HousePlatform } from '@/types'
import { STATUS_LABELS, PLATFORM_LABELS } from '@/types'

interface FilterBarProps {
  activeStatus: HouseStatus | 'all'
  onStatusChange: (status: HouseStatus | 'all') => void
  counts: Record<string, number>
  selectedPlatforms: HousePlatform[]
  onPlatformsChange: (platforms: HousePlatform[]) => void
  platformCounts: Record<string, number>
}

const TABS: { value: HouseStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'collecting', label: '收藏中' },
  { value: 'visited', label: '已看房' },
  { value: 'eliminated', label: '已淘汰' },
]

const PLATFORM_OPTIONS: HousePlatform[] = [
  'lianjia',
  'beike',
  'ziroom',
  'anjuke',
  'xiaohongshu',
  'woaiwojia',
  'douban',
  'century21',
  'other',
]

export function FilterBar({
  activeStatus,
  onStatusChange,
  counts,
  selectedPlatforms,
  onPlatformsChange,
  platformCounts,
}: FilterBarProps) {
  const handlePlatformToggle = (platform: HousePlatform) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platform))
    } else {
      onPlatformsChange([...selectedPlatforms, platform])
    }
  }

  const handleClearPlatforms = () => {
    onPlatformsChange([])
  }

  return (
    <div className="space-y-2">
      {/* Status filter */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const count = tab.value === 'all'
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : (counts[tab.value] ?? 0)

          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={cn(
                "flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                activeStatus === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "text-2xs",
                  activeStatus === tab.value ? "opacity-80" : "opacity-60"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Source filter */}
      <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={handleClearPlatforms}
          className={cn(
            "flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
            selectedPlatforms.length === 0
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          来源全部
        </button>
        {PLATFORM_OPTIONS.map(platform => {
          const isSelected = selectedPlatforms.includes(platform)
          const count = platformCounts[platform] ?? 0

          return (
            <button
              key={platform}
              onClick={() => handlePlatformToggle(platform)}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {PLATFORM_LABELS[platform]}
              {count > 0 && (
                <span className={cn(
                  "text-2xs",
                  isSelected ? "opacity-80" : "opacity-60"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { STATUS_LABELS, PLATFORM_LABELS }
