export type NoteType = 'platform_review' | 'visit_feeling' | 'other'
export type NoteSentiment = 'positive' | 'neutral' | 'negative'

export interface NoteImage {
  id: string
  dataUrl: string      // Base64 格式: "data:image/jpeg;base64,..."
  fileName?: string
  uploadedAt: string
}

export interface Note {
  id: string
  houseId: string
  type: NoteType
  content: string
  sentiment: NoteSentiment
  sourceUrl: string
  images?: NoteImage[]   // 可选，向后兼容
  createdAt: string
}

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  platform_review: '平台评价',
  visit_feeling: '实地感受',
  other: '其他备注',
}

export const SENTIMENT_LABELS: Record<NoteSentiment, string> = {
  positive: '正面',
  neutral: '中性',
  negative: '负面',
}
