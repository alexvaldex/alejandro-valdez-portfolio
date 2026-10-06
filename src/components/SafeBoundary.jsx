import { Component } from 'react'

// Keeps one broken section (e.g. an unexpected API response) from blanking the page
export default class SafeBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.error(err) }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children }
}
