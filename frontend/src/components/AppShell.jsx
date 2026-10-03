import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import OnlineStatusBadge from './OnlineStatusBadge'
import InstallPrompt from './InstallPrompt'
import { MitraLogo, NavGlyph } from './AgriIcons'

function Icon({ name, className = 'h-5 w-5' }) {
  return <NavGlyph name={name} className={className} />
}

function navItemsForRole(role, t) {
  if (role === 'farmer') {
    return [
      { to: '/farmer', icon: 'dashboard', label: t('nav.dashboard'), end: true },
      { to: '/farmer/chatbot', icon: 'chat', label: t('nav.chatbot') },
      { to: '/farmer/schemes', icon: 'scheme', label: t('nav.schemes') },
      { to: '/farmer/pacs', icon: 'pacs', label: t('nav.pacs') },
      { to: '/farmer/grievances', icon: 'grievance', label: t('nav.grievances') },
    ]
  }
  if (role === 'official') {
    return [
      { to: '/official', icon: 'dashboard', label: t('nav.dashboard'), end: true },
      { to: '/official/cases', icon: 'grievance', label: t('nav.assignedCases') },
    ]
  }
  return [
    { to: '/admin', icon: 'dashboard', label: t('nav.dashboard'), end: true },
    { to: '/admin/grievances', icon: 'grievance', label: t('nav.allGrievances') },
    { to: '/admin/users', icon: 'users', label: t('nav.users') },
  ]
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const items = navItemsForRole(user?.role, t)

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all ${
      isActive
        ? 'border-[#0B5F59] bg-leaf-600 text-white shadow-soft'
        : 'border-[#C6D3DA] bg-white text-soil-700 shadow-sm hover:border-leaf-600/60 hover:bg-leaf-50 hover:text-leaf-700'
    }`

  const mobileLinkClasses = ({ isActive }) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
      isActive ? 'text-leaf-600' : 'text-soil-700/70'
    }`

  return (
    <div className="h-[100dvh] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-soil-100 bg-white px-3.5 py-5 shadow-card">
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <MitraLogo size={38} />
          <span className="font-display text-lg font-semibold text-soil-900">{t('appName')}</span>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses}>
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-soil-100 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B7DDD7] bg-leaf-50 text-sm font-bold text-leaf-700">
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-soil-900">{user?.name}</p>
              <p className="truncate text-xs capitalize text-soil-700/70">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-semibold text-alert-600 hover:border-alert-500/20 hover:bg-alert-50">
            <Icon name="logout" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <div className="flex h-full flex-col lg:pl-60">
        <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-soil-100 bg-white/90 px-4 py-2.5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <MitraLogo size={32} />
            <span className="font-display text-base font-semibold text-soil-900">{t('appName')}</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <InstallPrompt />
            <OnlineStatusBadge />
            <LanguageSwitcher compact />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 pb-20 lg:px-8 lg:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-soil-100 bg-white shadow-[0_-6px_16px_-10px_rgba(23,32,51,0.2)] lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {items.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClasses}>
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="truncate max-w-[64px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
