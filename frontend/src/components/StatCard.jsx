export default function StatCard({ label, value, accent = 'leaf', hint }) {
  const accents = {
    leaf: 'bg-leaf-50 text-leaf-700 border-[#B7DDD7]',
    clay: 'bg-clay-50 text-clay-600 border-[#D5EE9C]',
    sky: 'bg-sky-50 text-sky-600 border-[#B7DDD7]',
    sun: 'bg-sun-50 text-sun-500 border-[#D5EE9C]',
    alert: 'bg-alert-50 text-alert-600 border-alert-500/20',
  }
  const bar = { leaf: 'bg-leaf-600', clay: 'bg-clay-500', sky: 'bg-leaf-500', sun: 'bg-clay-500', alert: 'bg-alert-500' }
  return (
    <div className="card relative overflow-hidden p-4">
      <span className={`absolute inset-x-0 top-0 h-1 ${bar[accent] || 'bg-leaf-600'}`} />
      <div className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${accents[accent]}`}>{label}</div>
      <p className="mt-2.5 truncate font-display text-2xl font-bold text-soil-900">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-soil-700/70">{hint}</p>}
    </div>
  )
}
