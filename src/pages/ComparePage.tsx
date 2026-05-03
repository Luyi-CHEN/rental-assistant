import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useHouseStore } from '@/store/house-store'
import { useCompareStore } from '@/store/compare-store'
import { useConfigStore } from '@/store/config-store'
import { cn, formatPrice } from '@/lib/utils'
import { GitCompareArrows, X, Check } from 'lucide-react'
import type { House } from '@/types'

export function ComparePage() {
  const navigate = useNavigate()
  const { state } = useHouseStore()
  const { compareIds, removeFromCompare, clearCompare } = useCompareStore()
  const { config } = useConfigStore()

  const compareHouses = useMemo(
    () => compareIds.map(id => state.houses.find(h => h.id === id)).filter(Boolean) as House[],
    [compareIds, state.houses]
  )

  // Define comparison dimensions
  const dimensions = useMemo(() => {
    const dims: { key: string; label: string; getValue: (h: House) => string; getBestIndex?: (houses: House[]) => number }[] = [
      {
        key: 'rent',
        label: '月租',
        getValue: h => formatPrice(h.rent),
        getBestIndex: hs => hs.reduce((best, h, i) => h.rent < hs[best].rent ? i : best, 0),
      },
      {
        key: 'area',
        label: '面积',
        getValue: h => h.area ? `${h.area}㎡` : '-',
        getBestIndex: hs => hs.reduce((best, h, i) => (h.area || 0) > (hs[best].area || 0) ? i : best, 0),
      },
      { key: 'layout', label: '户型', getValue: h => h.layout || '-' },
      { key: 'floor', label: '楼层', getValue: h => h.floor || '-' },
      { key: 'orientation', label: '朝向', getValue: h => h.orientation || '-' },
      { key: 'buildingType', label: '建筑类型', getValue: h => h.buildingType || '-' },
      { key: 'deposit', label: '押金', getValue: h => h.deposit || '-' },
      { key: 'district', label: '区域', getValue: h => h.district || '-' },
      {
        key: 'score',
        label: '综合评分',
        getValue: h => h.weightedScore > 0 ? `${h.weightedScore}分` : '-',
        getBestIndex: hs => hs.reduce((best, h, i) => h.weightedScore > hs[best].weightedScore ? i : best, 0),
      },
    ]

    // Add score dimensions
    for (const dim of config.scoreDimensions) {
      dims.push({
        key: `score_${dim.id}`,
        label: dim.name,
        getValue: h => h.scores[dim.id] ? `${h.scores[dim.id]}分` : '-',
        getBestIndex: hs => hs.reduce((best, h, i) => (h.scores[dim.id] || 0) > (hs[best].scores[dim.id] || 0) ? i : best, 0),
      })
    }

    return dims
  }, [config.scoreDimensions])

  if (compareHouses.length === 0) {
    return (
      <div className="pb-nav">
        <PageHeader title="房源对比" />
        <EmptyState
          icon={<GitCompareArrows className="w-7 h-7" />}
          title="暂无对比房源"
          description="从房源列表或详情页将房源加入对比"
          action={
            <Button onClick={() => navigate('/')}>
              去选择房源
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="pb-nav">
      <PageHeader
        title={`对比 (${compareHouses.length})`}
        right={
          <button onClick={clearCompare} className="text-xs text-destructive font-medium px-2 py-1">
            清空
          </button>
        }
      />

      {/* Comparison table */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[320px]">
          {/* House names header */}
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-10 bg-card w-20 p-3 text-left text-xs font-medium text-muted-foreground">
                维度
              </th>
              {compareHouses.map(house => (
                <th key={house.id} className="p-3 text-left min-w-[140px]">
                  <div className="flex items-start justify-between gap-1">
                    <button
                      onClick={() => navigate(`/house/${house.id}`)}
                      className="text-sm font-semibold text-foreground text-left hover:text-primary transition-colors line-clamp-2"
                    >
                      {house.name}
                    </button>
                    <button
                      onClick={() => removeFromCompare(house.id)}
                      className="shrink-0 p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dim, dimIdx) => {
              const bestIdx = dim.getBestIndex?.(compareHouses)
              return (
                <tr key={dim.key} className={cn("border-b border-border", dimIdx % 2 === 0 && "bg-secondary/30")}>
                  <td className="sticky left-0 z-10 bg-inherit p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {dim.label}
                  </td>
                  {compareHouses.map((house, houseIdx) => {
                    const isBest = bestIdx === houseIdx && dim.getBestIndex != null
                      && dim.getValue(house) !== '-'
                    return (
                      <td key={house.id} className="p-3">
                        <span className={cn(
                          "text-sm",
                          isBest ? "text-success font-semibold" : "text-foreground"
                        )}>
                          {dim.getValue(house)}
                          {isBest && <Check className="w-3.5 h-3.5 inline ml-1 text-success" />}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {/* Tags row */}
            <tr className="border-b border-border">
              <td className="sticky left-0 z-10 bg-card p-3 text-xs font-medium text-muted-foreground">标签</td>
              {compareHouses.map(house => (
                <td key={house.id} className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {house.tags.length > 0
                      ? house.tags.map(tag => <Badge key={tag} variant="secondary" className="text-2xs">{tag}</Badge>)
                      : <span className="text-sm text-muted-foreground">-</span>
                    }
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
