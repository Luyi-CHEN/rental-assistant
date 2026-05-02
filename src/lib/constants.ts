export const DEFAULT_TAGS = [
  '近地铁', '精装修', '有阳台', '拎包入住', '独立卫浴',
  '朝南', '安静', '采光好', '有电梯', '低楼层',
  '近公园', '近超市', '有车位', '押一付一',
]

export const SORT_OPTIONS = [
  { value: 'newest', label: '最新添加' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'score-desc', label: '评分从高到低' },
] as const

export type SortOption = typeof SORT_OPTIONS[number]['value']
