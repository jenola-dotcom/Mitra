import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGrievances } from '../../context/GrievanceContext'
import StatCard from '../../components/StatCard'
import { SproutIcon, ShieldIcon, ScaleIcon, BarnIcon } from '../../components/AgriIcons'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { myGrievances } = useGrievances()
  const openCount = myGrievances.filter((g) => !['resolved', 'rejected'].includes(g.status)).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-soil-900">
          {t('dashboards.farmerWelcome')}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-soil-700/80">{t('dashboards.farmerSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="District" value={user?.district || '—'} accent="leaf" hint={user?.state} />
        <StatCard label="Open grievances" value={String(openCount)} accent="clay" hint={`${myGrievances.length} total filed`} />
        <StatCard label="Saved schemes" value="0" accent="sky" hint="Built in Part 5" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink
          to="/farmer/chatbot"
          icon={<SproutIcon size={26} />}
          title={t('nav.chatbot')}
          desc="Ask about cooperative law, PACS loans, PMFBY and your member rights, in your language."
        />
        <QuickLink
          to="/farmer/grievances"
          icon={<ScaleIcon size={26} />}
          title={t('nav.grievances')}
          desc="Submit a new grievance or track one you already filed, with full status history."
        />
        <QuickLink
          to="/farmer/schemes"
          icon={<ShieldIcon size={26} />}
          title={t('nav.schemes')}
          desc="Browse government cooperative schemes and PMFBY crop insurance details."
        />
        <QuickLink
          to="/farmer/pacs"
          icon={<BarnIcon size={26} />}
          title={t('nav.pacs')}
          desc="Find your nearest Primary Agricultural Credit Society and its services."
        />
      </div>
    </div>
  )
}

function QuickLink({ to, title, desc, icon }) {
  return (
    <Link to={to} className="card group flex items-start gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:border-leaf-600/50 hover:shadow-soft">
      <span className="icon-tile h-12 w-12 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[15px] font-bold text-soil-900">{title}</h3>
        <p className="mt-1 text-[13px] leading-snug text-soil-700/80">{desc}</p>
      </div>
      <span className="self-center inline-flex items-center gap-1 text-sm font-semibold text-leaf-600 group-hover:text-leaf-700">
        Open
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M7.5 5 12.5 10 7.5 15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  )
}
