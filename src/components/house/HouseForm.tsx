import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { DEFAULT_TAGS } from '@/lib/constants'
import { showToast } from '@/components/ui/toast'
import type { House, HousePlatform, HouseStatus } from '@/types'
import { PLATFORM_LABELS } from '@/types'
import { cn } from '@/lib/utils'

type HouseFormData = Omit<House, 'id' | 'createdAt' | 'updatedAt' | 'weightedScore'>

interface HouseFormProps {
  initialData?: Partial<HouseFormData>
  onSubmit: (data: HouseFormData) => void
  submitLabel?: string
}

const PLATFORMS: HousePlatform[] = ['lianjia', 'beike', 'ziroom', 'anjuke', 'woaiwojia', 'xiaohongshu', 'douban', 'century21', 'other']

export function HouseForm({ initialData, onSubmit, submitLabel = '保存房源' }: HouseFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [district, setDistrict] = useState(initialData?.district ?? '')
  const [rent, setRent] = useState(initialData?.rent?.toString() ?? '')
  const [deposit, setDeposit] = useState(initialData?.deposit ?? '')
  const [area, setArea] = useState(initialData?.area?.toString() ?? '')
  const [layout, setLayout] = useState(initialData?.layout ?? '')
  const [floor, setFloor] = useState(initialData?.floor ?? '')
  const [orientation, setOrientation] = useState(initialData?.orientation ?? '')
  const [buildingType, setBuildingType] = useState(initialData?.buildingType ?? '')
  const [platform, setPlatform] = useState<HousePlatform>(initialData?.sourcePlatform ?? 'other')
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? '')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [remark, setRemark] = useState(initialData?.remark ?? '')
  const [showTagPicker, setShowTagPicker] = useState(false)

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('请填写小区/公寓名称', 'error')
      return
    }
    if (!rent.trim()) {
      showToast('请填写月租金', 'error')
      return
    }

    onSubmit({
      name: name.trim(),
      address: address.trim(),
      district: district.trim(),
      rent: parseInt(rent, 10),
      deposit: deposit.trim(),
      area: area ? parseFloat(area) : null,
      layout: layout.trim(),
      floor: floor.trim(),
      orientation: orientation.trim(),
      buildingType: buildingType.trim() || undefined,
      sourcePlatform: platform,
      sourceUrl: sourceUrl.trim(),
      status: (initialData?.status ?? 'collecting') as HouseStatus,
      tags,
      remark: remark.trim(),
      latitude: initialData?.latitude ?? null,
      longitude: initialData?.longitude ?? null,
      scores: initialData?.scores ?? {},
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Required fields */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">基本信息</label>
        <Input
          placeholder="小区/公寓名称 *"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Input
          placeholder="月租金 (元) *"
          type="number"
          inputMode="numeric"
          value={rent}
          onChange={e => setRent(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="面积 (㎡)" type="number" inputMode="decimal" value={area} onChange={e => setArea(e.target.value)} />
          <Input placeholder="户型 (如1室1厅)" value={layout} onChange={e => setLayout(e.target.value)} />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">位置信息</label>
        <Input placeholder="区域 (如朝阳区)" value={district} onChange={e => setDistrict(e.target.value)} />
        <Textarea placeholder="详细地址" value={address} onChange={e => setAddress(e.target.value)} rows={2} />
      </div>

      {/* Details */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">补充信息</label>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="楼层 (如6/18层)" value={floor} onChange={e => setFloor(e.target.value)} />
          <Input placeholder="朝向 (如南)" value={orientation} onChange={e => setOrientation(e.target.value)} />
        </div>
        <Input placeholder="建筑类型 (如高层/公寓/别墅)" value={buildingType} onChange={e => setBuildingType(e.target.value)} />
        <Input placeholder="押金方式 (如押一付三)" value={deposit} onChange={e => setDeposit(e.target.value)} />
      </div>

      {/* Source */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">来源</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                platform === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>
        <Input placeholder="来源链接 (可选)" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">标签</label>
          <button
            type="button"
            onClick={() => setShowTagPicker(!showTagPicker)}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            添加标签
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <Badge key={tag} className="gap-1 pr-1.5">
                {tag}
                <button type="button" onClick={() => toggleTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {showTagPicker && (
          <div className="flex flex-wrap gap-1.5 p-3 bg-secondary/50 rounded-lg">
            {DEFAULT_TAGS.filter(t => !tags.includes(t)).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="px-2.5 py-1 rounded-full text-xs bg-card border border-border text-foreground hover:bg-accent transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Remark */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">备注</label>
        <Textarea
          placeholder="记录备注信息 (可选)"
          value={remark}
          onChange={e => setRemark(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={!name.trim() || !rent.trim()}>
        {submitLabel}
      </Button>
    </form>
  )
}
