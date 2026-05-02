import { NavLink } from 'react-router-dom'
import { Home, GitCompareArrows, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompareStore } from '@/store/compare-store'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: '房源' },
  { to: '/compare', icon: GitCompareArrows, label: '对比' },
  { to: '/map', icon: MapPin, label: '地图' },
  { to: '/profile', icon: User, label: '我的' },
]

export function BottomNav() {
  const { compareIds } = useCompareStore()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border shadow-nav safe-bottom z-40">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.to === '/compare' && compareIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-primary text-primary-foreground text-2xs font-bold rounded-full flex items-center justify-center">
                  {compareIds.length}
                </span>
              )}
            </div>
            <span className="text-2xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
