import { cn } from '@/lib/utils'
import type { ScoreDimension } from '@/types'

interface RadarChartProps {
  scores: Record<string, number>
  dimensions: ScoreDimension[]
  size?: number
  className?: string
}

export function RadarChart({ scores, dimensions, size = 200, className }: RadarChartProps) {
  const activeDims = dimensions.filter(d => scores[d.id] != null && scores[d.id] > 0)
  if (activeDims.length < 3) return null

  const center = size / 2
  const radius = (size / 2) - 24
  const maxScore = 5

  const getPoint = (index: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / activeDims.length - Math.PI / 2
    const r = (value / maxScore) * radius
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  // Grid rings
  const rings = [1, 2, 3, 4, 5]
  
  // Score polygon
  const scorePoints = activeDims
    .map((d, i) => getPoint(i, scores[d.id] || 0))
    .map(p => `${p[0]},${p[1]}`)
    .join(' ')

  return (
    <div className={cn("flex justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map(ring => {
          const ringPoints = activeDims
            .map((_, i) => getPoint(i, ring))
            .map(p => `${p[0]},${p[1]}`)
            .join(' ')
          return (
            <polygon
              key={ring}
              points={ringPoints}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={ring === maxScore ? 1.5 : 0.5}
              opacity={0.6}
            />
          )
        })}

        {/* Axis lines */}
        {activeDims.map((_, i) => {
          const [x, y] = getPoint(i, maxScore)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.4}
            />
          )
        })}

        {/* Score area */}
        <polygon
          points={scorePoints}
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {activeDims.map((d, i) => {
          const [x, y] = getPoint(i, scores[d.id] || 0)
          return (
            <circle
              key={d.id}
              cx={x}
              cy={y}
              r={3.5}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--card))"
              strokeWidth={2}
            />
          )
        })}

        {/* Labels */}
        {activeDims.map((d, i) => {
          const angle = (Math.PI * 2 * i) / activeDims.length - Math.PI / 2
          const labelR = radius + 16
          const x = center + labelR * Math.cos(angle)
          const y = center + labelR * Math.sin(angle)
          return (
            <text
              key={d.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground"
              fontSize={11}
              fontWeight={500}
            >
              {d.name}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
