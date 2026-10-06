import Reveal from './Reveal'
import CountUp from './CountUp'
import { useGitHubProfile, useRepo, timeAgo } from '../hooks/useGitHub'
import { GITHUB_USER } from '../data/projects'

const LANG_COLORS = { TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', 'C++': '#f34b7d', C: '#555555', CMake: '#DA3434', HTML: '#e34c26', CSS: '#563d7c' }

// Home page: live profile, language mix, recently pushed repos
export function GitHubProfile() {
  const { data, error } = useGitHubProfile()
  const url = `https://github.com/${GITHUB_USER}`

  return (
    <section className="gh">
      <div className="ghHead">
        <div>
          <Reveal as="p" className="eyebrow">Live from GitHub</Reveal>
          <Reveal as="h2" className="title" delay={0.08}>Open source</Reveal>
        </div>
        <a className="btn" href={url} target="_blank" rel="noreferrer">@{GITHUB_USER}</a>
      </div>

      {error && <p className="body">GitHub is rate limiting right now. <a href={url} style={{ textDecoration: 'underline' }}>See the profile directly.</a></p>}

      {data && <>
        <div className="ghStats">
          <div><div className="statValue"><CountUp to={data.user.public_repos} /></div><div className="statLabel">Public repos</div></div>
          <div><div className="statValue"><CountUp to={data.languages.length} /></div><div className="statLabel">Languages</div></div>
          <div><div className="statValue">{timeAgo(data.repos[0]?.pushed_at).replace(' ago', '')}</div><div className="statLabel">Since last push</div></div>
        </div>

        <div className="langBar">
          {data.languages.map(([l, n]) => (
            <span key={l} title={l} style={{ flex: n, background: LANG_COLORS[l] || '#888' }} />
          ))}
        </div>
        <div className="langKey">
          {data.languages.map(([l]) => <span key={l}><i style={{ background: LANG_COLORS[l] || '#888' }} />{l}</span>)}
        </div>

        <div className="repoGrid">
          {data.repos.slice(0, 6).map((r, i) => (
            <Reveal key={r.id} delay={i * 0.06}>
              <a className="repo" href={r.html_url} target="_blank" rel="noreferrer">
                <h3>{r.name.replace(/[-_]/g, ' ')}</h3>
                <p>{r.description || 'No description yet.'}</p>
                <div className="repoMeta">
                  {r.language && <span><i style={{ background: LANG_COLORS[r.language] || '#888' }} />{r.language}</span>}
                  <span>Updated {timeAgo(r.pushed_at)}</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </>}
    </section>
  )
}

// Project page: source code card with live stats and recent commits
export function RepoCard({ name }) {
  const { data } = useRepo(name)
  if (!name) return null
  const url = `https://github.com/${GITHUB_USER}/${name}`
  const langs = data ? Object.entries(data.languages) : []
  const total = langs.reduce((s, [, n]) => s + n, 0)

  return (
    <section className="repoCard">
      <div>
        <p className="eyebrow">Source code</p>
        <h2 className="title" style={{ margin: '14px 0 20px' }}>{name.replace(/[-_]/g, ' ')}</h2>
        {data?.repo?.description && <p className="body" style={{ marginBottom: 28 }}>{data.repo.description}</p>}
        <a className="btn" href={url} target="_blank" rel="noreferrer">View on GitHub</a>
      </div>
      <div>
        {total > 0 && <>
          <div className="langBar">{langs.map(([l, n]) => <span key={l} style={{ flex: n, background: LANG_COLORS[l] || '#888' }} />)}</div>
          <div className="langKey" style={{ marginBottom: 32 }}>
            {langs.map(([l, n]) => <span key={l}><i style={{ background: LANG_COLORS[l] || '#888' }} />{l} {Math.round((n / total) * 100)}%</span>)}
          </div>
        </>}
        {data?.commits?.length > 0 && <>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Recent commits</p>
          <ul className="commits">
            {data.commits.map(c => (
              <li key={c.sha}>
                <a href={c.html_url} target="_blank" rel="noreferrer">
                  <code>{c.sha.slice(0, 7)}</code>
                  <span>{c.commit.message.split('\n')[0]}</span>
                  <small>{timeAgo(c.commit.author.date)}</small>
                </a>
              </li>
            ))}
          </ul>
        </>}
      </div>
    </section>
  )
}
