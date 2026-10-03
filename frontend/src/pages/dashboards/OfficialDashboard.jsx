import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGrievances } from '../../context/GrievanceContext'
import StatCard from '../../components/StatCard'

export default function OfficialDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { assignedToMe } = useGrievances()

  const counts = {
    pending: assignedToMe.filter((g) => g.status === 'pending').length,
    inProgress: assignedToMe.filter((g) => ['under_review', 'in_progress'].includes(g.status)).length,
    resolved: assignedToMe.filter((g) => g.status === 'resolved').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-soil-900">
          {t('dashboards.officialWelcome')}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-soil-700/80">{t('dashboards.officialSubtitle')}</p>
        {user?.designation && (
          <span className="mt-2 inline-block rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600">
            {user.designation}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Assigned" value={String(assignedToMe.length)} accent="sky" />
        <StatCard label="Pending" value={String(counts.pending)} accent="clay" />
        <StatCard label="In progress" value={String(counts.inProgress)} accent="sun" />
        <StatCard label="Resolved" value={String(counts.resolved)} accent="leaf" />
      </div>

      <Link to="/official/cases" className="card block p-6 transition-shadow hover:shadow-soft">
        <h2 className="font-display text-base font-semibold text-soil-900">{t('nav.assignedCases')}</h2>
        <p className="mt-2 text-sm text-soil-700/80">
          {assignedToMe.length === 0
            ? t('grievance.noCasesAssigned')
            : `Open your ${assignedToMe.length} assigned case${assignedToMe.length === 1 ? '' : 's'} to review, add notes, and update status.`}
        </p>
      </Link>
    </div>
  )
}
