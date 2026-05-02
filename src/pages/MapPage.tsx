import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/empty-state'
import { useHouseStore } from '@/store/house-store'
import { MapPin } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { STATUS_LABELS } from '@/types'

export function MapPage() {
  const { state } = useHouseStore()

  return (
    <div className="pb-nav">
      <PageHeader title="地图总览" />

      {state.houses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-7 h-7" />}
          title="暂无房源"
          description="添加房源并填写地址后，即可在地图上查看"
        />
      ) : (
        <div className="px-4 py-4">
          {/* Map placeholder with info */}
          <div className="bg-secondary/50 rounded-2xl border border-border overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">地图功能</p>
                <p className="text-xs text-muted-foreground mt-1">
                  需要配置高德地图API Key
                </p>
              </div>
            </div>
          </div>

          {/* House list with location info */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              所有房源位置 ({state.houses.length}套)
            </h3>
            {state.houses.map((house, idx) => (
              <div
                key={house.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0",
                  house.status === 'collecting' ? 'bg-primary' :
                  house.status === 'visited' ? 'bg-warning' :
                  house.status === 'eliminated' ? 'bg-muted-foreground' :
                  'bg-success'
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{house.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {house.district || house.address || '未填写地址'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-primary">{formatPrice(house.rent)}</div>
                  <div className="text-2xs text-muted-foreground">{STATUS_LABELS[house.status]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
