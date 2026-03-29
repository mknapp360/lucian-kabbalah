import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import System from './pages/System'
import ThreeStreams from './pages/ThreeStreams'
import Correction from './pages/Correction'
import Sources from './pages/Sources'
import Canon from './pages/Canon'
import GetYourChart from './pages/GetYourChart'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/system" element={<System />} />
          <Route path="/three-streams" element={<ThreeStreams />} />
          <Route path="/correction" element={<Correction />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/canon" element={<Canon />} />
          <Route path="/get-your-chart" element={<GetYourChart />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
