import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'

export default function AppLayout() {
  return (
    <div className="app">
      {/* Brand cell (above sidebar) */}
      <div className="brandbar">
        <img className="mark" src="/Armoiries_du_Togo.svg.png" alt="Emblème" />
        <div className="stack">
          <span className="app-name">GestiActivités</span>
          <span className="app-sub">Planification des activités</span>
        </div>
      </div>

      <Topbar />
      <Sidebar />

      <main className="main">
        <Outlet />
        <Footer />
      </main>
    </div>
  )
}
