import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { listAllUsers } from '../../lib/users'
import LoadingSpinner from '../../components/LoadingSpinner'

const ROLE_CHIP = {
  farmer: 'bg-leaf-100 text-leaf-700',
  official: 'bg-sky-50 text-sky-600',
  admin: 'bg-clay-100 text-clay-600',
}

export default function AdminUsers() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    listAllUsers().then((list) => {
      if (active) {
        setUsers(list)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-soil-900">{t('nav.users')}</h1>
        <p className="mt-1 text-sm text-soil-700/80">All registered farmers, officials, and admins.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-field max-w-xs flex-1"
        />
        <div className="flex gap-2">
          {['all', 'farmer', 'official', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-xl border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                roleFilter === r ? 'border-leaf-600 bg-leaf-50 text-leaf-700' : 'border-soil-200 text-soil-700 hover:bg-soil-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label={t('common.loading')} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-soil-100 bg-soil-50 text-xs uppercase tracking-wide text-soil-700/70">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil-100">
              {filtered.map((u) => (
                <tr key={u.uid}>
                  <td className="px-4 py-3 font-medium text-soil-900">{u.name}</td>
                  <td className="px-4 py-3 text-soil-700/80">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_CHIP[u.role] || ''}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-soil-700/80">{u.district || '—'}</td>
                  <td className="px-4 py-3 text-soil-700/60">
                    {u.role === 'official' ? (u.designation || '—') : u.role === 'farmer' ? (u.pacsSociety || '—') : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-soil-700/70">No users match this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
