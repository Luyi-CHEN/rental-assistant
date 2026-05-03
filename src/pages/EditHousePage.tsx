import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { HouseForm } from '@/components/house/HouseForm'
import { useHouseStore } from '@/store/house-store'
import { showToast } from '@/components/ui/toast'
import type { House } from '@/types'

type HouseFormData = Omit<House, 'id' | 'createdAt' | 'updatedAt' | 'weightedScore'>

export function EditHousePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, updateHouse } = useHouseStore()

  const house = state.houses.find(h => h.id === id)

  if (!house) {
    return (
      <div className="pb-24">
        <PageHeader title="编辑房源" showBack />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">房源不存在</p>
        </div>
      </div>
    )
  }

  const initialData: HouseFormData = {
    name: house.name,
    address: house.address,
    district: house.district,
    rent: house.rent,
    deposit: house.deposit,
    area: house.area,
    layout: house.layout,
    floor: house.floor,
    orientation: house.orientation,
    buildingType: house.buildingType,
    sourcePlatform: house.sourcePlatform,
    sourceUrl: house.sourceUrl,
    status: house.status,
    tags: house.tags,
    latitude: house.latitude,
    longitude: house.longitude,
    remark: house.remark,
    scores: house.scores,
  }

  const handleSubmit = async (data: HouseFormData) => {
    try {
      await updateHouse(house.id, data)
      showToast('房源已更新')
      navigate(`/house/${house.id}`)
    } catch {
      showToast('保存失败，请重试', 'error')
    }
  }

  return (
    <div className="pb-24">
      <PageHeader title="编辑房源" showBack />
      <div className="px-4">
        <HouseForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="保存修改"
        />
      </div>
    </div>
  )
}
