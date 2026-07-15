import { Link } from 'react-router-dom';
import './Layout.css';

/* Icônes en ligne */
const ICONS = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>
  ),
  jobs: (
    <svg viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M7 6V4.5C7 3.67 7.67 3 8.5 3h3c.83 0 1.5.67 1.5 1.5V6" stroke="currentColor" strokeWidth="1.6"/></svg>
  ),
  people: (
    <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 17c0-3 3-5 6.5-5s6.5 2 6.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  chart: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M3 17V9M9 17V3M15 17v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  shield: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M10 2.5 16 5v4.5c0 4-2.6 6.7-6 8-3.4-1.3-6-4-6-8V5l6-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
  ),
  calendar: (
    <svg viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M2.5 8h15M6.5 2v4M13.5 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  bookmark: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M5 3.5h10v13l-5-3.2-5 3.2v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  chevron: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M5.5 8 10 12.5 14.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
};

/* Navigation */
const NAV_CONFIG = {
  recruteur: {
    main: [
      { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/recruteur' },
      { key: 'jobs', label: 'Job Board', icon: 'jobs', path: '/recruteur/jobs' },
      { key: 'people', label: 'Candidats', icon: 'people', path: '/recruteur/candidats' },
      { key: 'chart', label: 'Rapports', icon: 'chart', path: '/recruteur/rapports' },
      { key: 'shield', label: 'Rôles utilisateurs', icon: 'shield', path: '/recruteur/roles' },
    ],
    general: [
      { key: 'calendar', label: 'Calendrier', icon: 'calendar', path: '/calendrier' },
    ],
  },
  candidat: {
    main: [
      { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/candidat' },
      { key: 'saved', label: 'Sauvegardées', icon: 'bookmark', path: '/candidat/sauvegardees' },
    ],
    general: [],
  },
};

export function Sidebar({ role, activeKey }) {
  const config = NAV_CONFIG[role];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">◆</span>
        <span className="sidebar-brand-name">JobBoard</span>
      </div>
      <nav className="sidebar-nav">
        <ul className="nav-group">
          {config.main.map((item) => (
            <li key={item.key}>
              <Link to={item.path} className={`nav-item${activeKey === item.key ? ' nav-item-active' : ''}`}>
                <span className="nav-icon">{ICONS[item.icon]}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {config.general.length > 0 && (
          <>
            <p className="nav-group-label">Général</p>
            <ul className="nav-group">
              {config.general.map((item) => (
                <li key={item.key}>
                  <Link to={item.path} className={`nav-item${activeKey === item.key ? ' nav-item-active' : ''}`}>
                    <span className="nav-icon">{ICONS[item.icon]}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </aside>
  );
}

export function TopBar({ userName, userRole, searchValue, onSearchChange, searchPlaceholder }) {
  const initial = userName?.charAt(0)?.toUpperCase() || '?';
  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="topbar-search-icon">{ICONS.search}</span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder || 'Rechercher...'}
          aria-label="Rechercher"
        />
      </div>
      <div className="topbar-user">
        <div className="topbar-avatar">{initial}</div>
        <div className="topbar-user-info">
          <span className="topbar-user-name">{userName}</span>
          <span className="topbar-user-role">{userRole}</span>
        </div>
        <span className="topbar-chevron">{ICONS.chevron}</span>
      </div>
    </header>
  );
}

export function StatCard({ value, label, delta, accent }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent }}>
      <div className="stat-card-top">
        <span className="stat-card-value">{value}</span>
        {delta && <span className="stat-card-delta">{delta}</span>}
      </div>
      <span className="stat-card-label">{label}</span>
    </div>
  );
}

export default function Layout({
  role,
  activeKey,
  userName,
  userRole,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
}) {
  return (
    <div className="app-layout">
      <Sidebar role={role} activeKey={activeKey} />
      <div className="app-main">
        <TopBar
          userName={userName}
          userRole={userRole}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}