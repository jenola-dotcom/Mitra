import { useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { SCHEMES, SCHEME_CATEGORIES } from '../../data/schemes'

export default function Schemes() {
  const { t, language } = useLanguage()
  const [category, setCategory] = useState('all')
  const [openId, setOpenId] = useState(null)

  const filtered = useMemo(
    () => (category === 'all' ? SCHEMES : SCHEMES.filter((s) => s.category === category)),
    [category]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-soil-900">{t('nav.schemes')}</h1>
        <p className="mt-1 text-sm text-soil-700/80">
          Sample scheme information for this prototype — always confirm current deadlines and eligibility at the official link before applying.
        </p>
      </div>

      <div className="flex gap-2">
        {SCHEME_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-xl border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
              category === c ? 'border-leaf-600 bg-leaf-50 text-leaf-700' : 'border-soil-200 text-soil-700 hover:bg-soil-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((scheme) => {
          const open = openId === scheme.id
          return (
            <div key={scheme.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : scheme.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div>
                  <h2 className="font-display text-base font-semibold text-soil-900">{scheme.name[language] || scheme.name.en}</h2>
                  <p className="mt-1 text-sm text-soil-700/80">{scheme.description[language] || scheme.description.en}</p>
                  <p className="mt-1.5 text-xs text-soil-700/60">Sample data · last updated {scheme.lastUpdated}</p>
                </div>
                <svg viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 shrink-0 text-soil-700/50 transition-transform ${open ? 'rotate-180' : ''}`}>
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                </svg>
              </button>

              {open && (
                <div className="space-y-4 border-t border-soil-100 px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-soil-900">Eligibility</h3>
                    <p className="mt-1 text-sm text-soil-700/80">{scheme.eligibility[language] || scheme.eligibility.en}</p>
                  </div>
                  {scheme.documents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-soil-900">Required documents</h3>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-soil-700/80">
                        {scheme.documents.map((d) => <li key={d}>{d}</li>)}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-soil-900">Application steps</h3>
                    <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-soil-700/80">
                      {scheme.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-soil-700/70">Season: {scheme.season}</span>
                    <a href={scheme.officialLink} target="_blank" rel="noreferrer" className="font-medium text-leaf-600 hover:text-leaf-700">
                      Official portal →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
