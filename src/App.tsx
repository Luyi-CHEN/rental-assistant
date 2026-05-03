import { HashRouter, Routes, Route } from 'react-router-dom'
import { HouseProvider } from '@/store/house-store'
import { CompareProvider } from '@/store/compare-store'
import { ConfigProvider } from '@/store/config-store'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/ui/toast'
import { HouseListPage } from '@/pages/HouseListPage'
import { HouseDetailPage } from '@/pages/HouseDetailPage'
import { AddHousePage } from '@/pages/AddHousePage'
import { EditHousePage } from '@/pages/EditHousePage'
import { ComparePage } from '@/pages/ComparePage'
import { MapPage } from '@/pages/MapPage'
import { ProfilePage } from '@/pages/ProfilePage'

function App() {
  return (
    <HashRouter>
      <ConfigProvider>
        <HouseProvider>
          <CompareProvider>
            <div className="min-h-dvh bg-background">
              <Routes>
                <Route path="/" element={<HouseListPage />} />
                <Route path="/house/:id" element={<HouseDetailPage />} />
                <Route path="/add" element={<AddHousePage />} />
                <Route path="/edit/:id" element={<EditHousePage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
              <BottomNav />
              <ToastContainer />
            </div>
          </CompareProvider>
        </HouseProvider>
      </ConfigProvider>
    </HashRouter>
  )
}

export default App
