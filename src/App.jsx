import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Intro from './components/Intro'
import CommandPalette from './components/CommandPalette'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import CategoryPage from './pages/CategoryPage'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import { categories } from './data/projects'

export default function App() {
  const { pathname } = useLocation()
  const [palette, setPalette] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <Intro />
      <Nav onOpenPalette={() => setPalette(true)} />
      <CommandPalette open={palette} setOpen={setPalette} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {categories.map(k => <Route key={k.id} path={`/${k.id}`} element={<CategoryPage id={k.id} />} />)}
        <Route path="/projects/:id" element={<ProjectPage key={pathname} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
    </>
  )
}
