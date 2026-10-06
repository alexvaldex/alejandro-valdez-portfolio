import { Link } from 'react-router-dom'
import { useContent } from '../hooks/useContent'

export default function Footer() {
  const f = useContent('footer')
  return (
    <footer className="footer">
      <small>Alejandro Valdez © {new Date().getFullYear()}</small>
      <nav>
        <a href={`mailto:${f.email}`}>Email</a>
        <a href={f.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={f.github} target="_blank" rel="noreferrer">GitHub</a>
        <a href={`${f.github}/alejandro-valdez-portfolio`} target="_blank" rel="noreferrer">Site source</a>
        <Link to="/admin">Edit</Link>
      </nav>
    </footer>
  )
}
