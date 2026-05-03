export type HousePlatform = 'lianjia' | 'beike' | 'ziroom' | 'anjuke' | 'xiaohongshu' | 'woaiwojia' | 'douban' | 'century21' | 'other'
export type HouseStatus = 'collecting' | 'visited' | 'eliminated' | 'pending_sign' | 'signed'

export interface House {
  id: string
  name: string
  address: string
  district: string
  rent: number
  deposit: string
  area: number | null
  layout: string
  floor: string
  orientation: string
  sourcePlatform: HousePlatform
  sourceUrl: string
  status: HouseStatus
  tags: string[]
  latitude: number | null
  longitude: number | null
  remark: string
  scores: Record<string, number>
  weightedScore: number
  createdAt: string
  updatedAt: string
}

export const PLATFORM_LABELS: Record<HousePlatform, string> = {
  lianjia: '链家',
  beike: '贝壳',
  ziroom: '自如',
  anjuke: '安居客',
  xiaohongshu: '小红书',
  woaiwojia: '我爱我家',
  douban: '豆瓣',
  century21: '21世纪',
  other: '其他',
}

export const STATUS_LABELS: Record<HouseStatus, string> = {
  collecting: '收藏中',
  visited: '已看房',
  eliminated: '已淘汰',
  pending_sign: '待签约',
  signed: '已签约',
}

export const STATUS_FLOW: Record<HouseStatus, HouseStatus[]> = {
  collecting: ['visited', 'eliminated'],
  visited: ['pending_sign', 'eliminated', 'collecting'],
  eliminated: ['collecting'],
  pending_sign: ['signed', 'collecting'],
  signed: [],
}
