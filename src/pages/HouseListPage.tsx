import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, ArrowUpDown } from 'lucide-react'
import { useHouseStore } from '@/store/house-store'
import { HouseCard } from '@/components/house/HouseCard'
import { FilterBar } from '@/components/house/FilterBar'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { SORT_OPTIONS, type SortOption } from '@/lib/constants'
import type { HouseStatus, HousePlatform } from '@/types'
import { getNotesByHouseId } from '@/api/note-api'
import { Home } from 'lucide-react'

export function HouseListPage() {
  const navigate = useNavigate()
  const { state } = useHouseStore()
  const [statusFilter, setStatusFilter] = useState<HouseStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showSort, setShowSort] = useState(false)
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({})
  const [selectedPlatforms, setSelectedPlatforms] = useState<HousePlatform[]>([])

  // Load note counts
  useEffect(() => {
    async function loadNoteCounts() {
      const counts: Record<string, number> = {}
      for (const house of state.houses) {
        const notes = await getNotesByHouseId(house.id)
        counts[house.id] = notes.length
      }
      setNoteCounts(counts)
    }
    if (state.houses.length > 0) loadNoteCounts()
  }, [state.houses])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const h of state.houses) {
      counts[h.status] = (counts[h.status] || 0) + 1
    }
    return counts
  }, [state.houses])

  // Platform counts
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const h of state.houses) {
      counts[h.sourcePlatform] = (counts[h.sourcePlatform] || 0) + 1
    }
    return counts
  }, [state.houses])

  // Filtered + sorted houses
  const filteredHouses = useMemo(() => {
    let result = state.houses

    if (statusFilter !== 'all') {
      result = result.filter(h => h.status === statusFilter)
    }

    if (selectedPlatforms.length > 0) {
      result = result.filter(h => selectedPlatforms.includes(h.sourcePlatform))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.tags.some(t => t.includes(q))
      )
    }

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.rent - b.rent)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.rent - a.rent)
        break
      case 'score-desc':
        result = [...result].sort((a, b) => b.weightedScore - a.weightedScore)
        break
      default:
        break
    }

    return result
  }, [state.houses, statusFilter, selectedPlatforms, searchQuery, sortBy])

  // Stats
  const avgRent = useMemo(() => {
    if (filteredHouses.length === 0) return 0
    return Math.round(filteredHouses.reduce((sum, h) => sum + h.rent, 0) / filteredHouses.length)
  }, [filteredHouses])

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-nav">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-12 px-4 safe-top">
          <h1 className="text-lg font-bold text-foreground">租房助手</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="touch-target flex items-center justify-center text-foreground"
            >
              {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/add')}
              className="touch-target flex items-center justify-center text-primary"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="px-4 pb-2 animate-slide-down">
            <input
              type="text"
              placeholder="搜索小区名、地址、标签..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full h-9 px-3 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </header>

      {/* Filter tabs */}
      <FilterBar
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        counts={statusCounts}
        selectedPlatforms={selectedPlatforms}
        onPlatformsChange={setSelectedPlatforms}
        platformCounts={platformCounts}
      />

      {/* Stats bar */}
      {state.houses.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs text-muted-foreground">
            共 {filteredHouses.length} 套 · 均价 {formatPrice(avgRent)}
          </span>
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
          </button>
        </div>
      )}

      {/* Sort dropdown */}
      {showSort && (
        <div className="mx-4 mb-2 bg-card border border-border rounded-xl shadow-card overflow-hidden animate-scale-in">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setShowSort(false) }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-sm transition-colors",
                sortBy === opt.value ? "text-primary bg-accent font-medium" : "text-foreground hover:bg-secondary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* House list */}
      {filteredHouses.length === 0 ? (
        <EmptyState
          icon={<Home className="w-7 h-7" />}
          title={state.houses.length === 0 ? "还没有收藏房源" : "没有符合条件的房源"}
          description={state.houses.length === 0 ? "点击右上角 + 添加你的第一套房源吧" : "试试调整筛选条件"}
          action={state.houses.length === 0 ? (
            <Button onClick={() => navigate('/add')}>
              <Plus className="w-4 h-4 mr-1.5" />
              添加房源
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {filteredHouses.map(house => (
            <HouseCard
              key={house.id}
              house={house}
              noteCount={noteCounts[house.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
