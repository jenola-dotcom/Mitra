import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGrievances } from '../../context/GrievanceContext'
import StatCard from '../../components/StatCard'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { grievances } = useGrievances()

  const unassigned = grievances.filter((g) => !g.assignedOfficialId).length
  const escalated = grievances.filter((g) => g.status === 'escalated').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-soil-900">
          {t('dashboards.adminWelcome')}
        </h1>
        <p className="mt-1 text-sm text-soil-700/80">{t('dashboards.adminSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value="3" accent="leaf" hint="Demo accounts seeded" />
        <StatCard label="Grievances" value={String(grievances.length)} accent="clay" />
        <StatCard label="Unassigned" value={String(unassigned)} accent="sky" />
        <StatCard label="Escalated" value={String(escalated)} accent="alert" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/grievances" className="card block p-6 transition-shadow hover:shadow-soft">
          <h2 className="font-display text-base font-semibold text-soil-900">{t('grievance.allCases')}</h2>
          <p className="mt-2 text-sm text-soil-700/80">
            Assign or reassign officials, review status, and manage escalations across all
            filed grievances.
          </p>
        </Link>
        <div className="card p-6">
          <h2 className="font-display text-base font-semibold text-soil-900">Part 2 status</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-soil-700/80">
            <li>✓ Firestore grievance model + security rules</li>
            <li>✓ Farmer submit → official update → farmer sees update, persisted</li>
            <li>✓ Admin assign / reassign / escalation view</li>
            <li>✓ Works in demo mode and live Firebase mode</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
