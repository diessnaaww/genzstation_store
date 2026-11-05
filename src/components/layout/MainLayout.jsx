import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

function MainLayout() {
  return <div id="top" className="flex min-h-screen flex-col"><Navbar /><main className="flex-1"><Outlet /></main><Footer /></div>
}

export default MainLayout
