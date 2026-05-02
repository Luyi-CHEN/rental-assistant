import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { RadarChart } from '@/components/score/RadarChart'
import { ScoreEditor } from '@/components/score/ScoreEditor'
import { NoteTimeline } from '@/components/note/NoteTimeline'
import { AddNoteSheet } from '@/components/note/AddNoteSheet'
import { useHouseStore } from '@/store/house-store'
import { useConfigStore } from '@/store/config-store'
import { useCompareStore } from '@/store/compare-store'
import { showToast } from '@/components/ui/toast'
import { getNotesByHouseId, addNote, deleteNote } from '@/db/note-repo'
import { calculateWeightedScore } from '@/lib/score-calculator'
import { cn, formatPrice } from '@/lib/utils'
import { PLATFORM_LABELS, STATUS_LABELS, STATUS_FLOW } from '@/types'
import type { House, Note, NoteType, NoteSentiment } from '@/types'
import {
  MapPin, Star, ExternalLink, GitCompareArrows, StickyNote,
  Trash2, Plus, Edit3, Tag
} from 'lucide-react'

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

export function HouseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, updateHouse, updateStatus, removeHouse } = useHouseStore()
  const { config } = useConfigStore()
  const { addToCompare, isInCompare, canAddMore } = useCompareStore()

  const [notes, setNotes] = useState<Note[]>([])
  const [showAddNote, setShowAddNote] = useState(false)
  const [showScoreEditor, setShowScoreEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const house = state.houses.find(h => h.id === id)

  const loadNotes = useCallback(async () => {
    if (!id) return
    const data = await getNotesByHouseId(id)
    setNotes(data)
  }, [id])

  useEffect(() => { loadNotes() }, [loadNotes])

  if (!house) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">房源不存在</p>
      </div>
    )
  }

  const handleAddNote = async (data: { type: NoteType; content: string; sentiment: NoteSentiment; sourceUrl: string }) => {
    await addNote({ houseId: house.id, ...data })
    showToast('笔记已添加')
    loadNotes()
  }

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId)
    showToast('笔记已删除')
    loadNotes()
  }

  const handleSaveScores = async (scores: Record<string, number>) => {
    const weightedScore = calculateWeightedScore(scores, config.scoreDimensions)
    await updateHouse(house.id, { scores, weightedScore })
  }

  const handleStatusChange = async (newStatus: House['status']) => {
    await updateStatus(house.id, newStatus)
    showToast(`已标记为${STATUS_LABELS[newStatus]}`)
  }

  const handleDelete = async () => {
    await removeHouse(house.id)
    showToast('房源已删除')
    navigate('/')
  }

  const nextStatuses = STATUS_FLOW[house.status]

  return (
    <div className="pb-24">
      <PageHeader
        title={house.name}
        showBack
        right={
          <button
            onClick={() => navigate(`/edit/${house.id}`)}
            className="touch-target flex items-center justify-center text-muted-foreground"
          >
            <Edit3 className="w-4.5 h-4.5" />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-6">
        {/* Basic info card */}
        <div className="space-y-3">
          {/* Platform + Status */}
          <div className="flex items-center gap-2">
            <Badge variant="platform" className={cn("text-xs px-2.5 py-0.5", PLATFORM_COLORS[house.sourcePlatform])}>
              {PLATFORM_LABELS[house.sourcePlatform]}
            </Badge>
            <Badge className="text-xs">{STATUS_LABELS[house.status]}</Badge>
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-foreground">{house.name}</h2>

          {/* Address */}
          {(house.district || house.address) && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-sm">{[house.district, house.address].filter(Boolean).join(' · ')}</span>
            </div>
          )}

          {/* Price + details */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">{formatPrice(house.rent)}</span>
              <span className="text-sm text-muted-foreground">/月</span>
            </div>
            {house.deposit && (
              <span className="text-sm text-muted-foreground">{house.deposit}</span>
            )}
          </div>

          {/* Property details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {house.layout && <span>{house.layout}</span>}
            {house.area && <span>{house.area}㎡</span>}
            {house.orientation && <span>{house.orientation}向</span>}
            {house.floor && <span>{house.floor}</span>}
          </div>

          {/* Tags */}
          {house.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {house.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Remark */}
        {house.remark && (
          <div className="bg-accent/50 rounded-xl p-3.5">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">备注</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{house.remark}</p>
          </div>
        )}

        {/* Score section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              我的评分
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowScoreEditor(true)}>
              {Object.keys(house.scores).length > 0 ? '编辑' : '去打分'}
            </Button>
          </div>

          {house.weightedScore > 0 ? (
            <div className="bg-accent/50 rounded-xl p-4">
              <RadarChart
                scores={house.scores}
                dimensions={config.scoreDimensions}
                size={220}
              />
              <div className="text-center mt-3">
                <span className="text-sm text-muted-foreground">综合加权得分</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="text-2xl font-bold text-primary">{house.weightedScore}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">还没有评分，点击「去打分」开始</p>
            </div>
          )}
        </div>

        {/* Notes section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-primary" />
              笔记记录
              {notes.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">({notes.length})</span>
              )}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAddNote(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              添加
            </Button>
          </div>

          {notes.length > 0 ? (
            <NoteTimeline notes={notes} onDelete={handleDeleteNote} />
          ) : (
            <div className="bg-secondary/50 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">暂无笔记，记录看房感受或平台评价</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* Status transitions */}
          {nextStatuses.length > 0 && (
            <div className="flex gap-2">
              {nextStatuses.map(s => (
                <Button
                  key={s}
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusChange(s)}
                >
                  标记{STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {house.sourceUrl && (
              <a
                href={house.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center h-11 px-5 rounded-lg border border-input bg-card text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all active:scale-[0.97]"
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                查看原链接
              </a>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (isInCompare(house.id)) {
                  showToast('已在对比列表中', 'info')
                } else if (!canAddMore) {
                  showToast('最多对比4套房源', 'error')
                } else {
                  addToCompare(house.id)
                  showToast('已加入对比')
                }
              }}
            >
              <GitCompareArrows className="w-4 h-4 mr-1.5" />
              {isInCompare(house.id) ? '已加入对比' : '加入对比'}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/5"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            删除房源
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AddNoteSheet
        open={showAddNote}
        onClose={() => setShowAddNote(false)}
        onSubmit={handleAddNote}
      />
      <ScoreEditor
        open={showScoreEditor}
        onClose={() => setShowScoreEditor(false)}
        dimensions={config.scoreDimensions}
        scores={house.scores}
        onSave={handleSaveScores}
      />
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="删除房源"
        description="删除后将无法恢复，关联的笔记也会一同删除"
        confirmText="删除"
        variant="destructive"
      />
    </div>
  )
}
