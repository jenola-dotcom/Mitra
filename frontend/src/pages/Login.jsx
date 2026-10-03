import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { DEMO_ACCOUNTS } from '../lib/demoAuth'
import { roleHome } from '../components/ProtectedRoute'
import { MitraLogo, WheatIcon, ShieldIcon, DropIcon, ScaleIcon, BarnIcon, SproutIcon } from '../components/AgriIcons'

const ROLE_META = {
  farmer: { chip: 'bg-leaf-100 text-leaf-700 border border-[#B7DDD7]' },
  official: { chip: 'bg-sky-50 text-sky-600 border border-[#B7DDD7]' },
  admin: { chip: 'bg-clay-100 text-clay-600 border border-[#D5EE9C]' },
}

export default function Login() {
  const { login, isDemoMode } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const profile = await login(email, password)
      const redirectTo = location.state?.from?.pathname
      navigate(redirectTo && redirectTo !== '/login' ? redirectTo : roleHome(profile.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid h-[100dvh] overflow-hidden bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Left: friendly illustrated panel */}
      <div className="relative hidden overflow-hidden border-r border-soil-100 bg-gradient-to-br from-leaf-50 via-white to-clay-50 px-10 py-8 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sun-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-leaf-500/15 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <MitraLogo size={44} />
          <span className="font-display text-2xl font-extrabold text-leaf-700">{t('appName')}</span>
        </div>

        <div className="relative z-10 max-w-md animate-rise">
          <h1 className="font-display text-3xl font-extrabold leading-[1.15] text-soil-900 xl:text-4xl">
            {t('tagline')}
          </h1>
          <p className="mt-3 text-sm text-soil-700/85">
            Cooperative laws, PACS services, crop insurance guidance and grievance
            tracking for members across Tamil Nadu — starting with Madurai district.
          </p>
          <ServicePanel />
          <ul className="mt-4 grid gap-2 text-[13px] text-soil-800">
            <Feature icon={<ShieldIcon size={22} />}>Answers grounded in verified cooperative documents, with sources cited</Feature>
            <Feature icon={<ScaleIcon size={22} />}>Submit and track grievances with a permanent reference ID</Feature>
            <Feature icon={<WheatIcon size={22} />}>Works in Tamil, Hindi and English — voice included</Feature>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-soil-700/60">
          Prototype for SIH 2026 · Problem Statement 26088 · Ministry of Cooperation
        </p>
      </div>

      {/* Right: form */}
      <div className="flex flex-col justify-center overflow-y-auto px-6 py-6 sm:px-12 lg:px-14">
        <div className="mx-auto w-full max-w-md animate-rise">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <MitraLogo size={36} />
              <span className="font-display text-xl font-extrabold text-leaf-700">{t('appName')}</span>
            </div>
            <LanguageSwitcher />
          </div>
          <div className="mb-3 hidden justify-end lg:flex">
            <LanguageSwitcher />
          </div>

          <div className="rounded-2xl border border-[#C6D3DA] bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-1 flex items-center gap-2">
              <DropIcon size={22} />
              <h2 className="font-display text-xl font-bold text-soil-900">{t('auth.loginTitle')}</h2>
            </div>
            <p className="text-sm text-soil-700/80">{t('auth.loginSubtitle')}</p>

            {isDemoMode && (
              <div className="mt-4 rounded-xl border border-[#D5EE9C] bg-sun-50 px-3 py-2 text-xs font-medium text-soil-800">
                {t('auth.demoModeBadge')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="label" htmlFor="email">{t('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">{t('auth.password')}</label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div role="alert" className="rounded-xl bg-alert-50 px-3.5 py-2.5 text-sm text-alert-600">
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
                {submitting ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-soil-700/80">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-leaf-600 hover:text-leaf-700">
                {t('auth.signUpLink')}
              </Link>
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-soil-100 bg-leaf-50/60 p-3.5">
            <p className="text-sm font-semibold text-soil-900">{t('auth.demoAccounts')}</p>
            <p className="mt-0.5 text-xs text-soil-700/70">{t('auth.demoHint')}</p>
            <div className="mt-2.5 space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.uid}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex w-full items-center justify-between rounded-xl border border-soil-200/80 bg-white px-3 py-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-leaf-500 hover:shadow-soft"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-soil-900">{acc.name}</span>
                    <span className="block truncate text-xs text-soil-700/70">{acc.email}</span>
                  </span>
                  <span className={`ml-2 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_META[acc.role].chip}`}>
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, children }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-soil-100 bg-white/80 px-3 py-2 shadow-sm">
      <span className="flex icon-tile h-8 w-8 shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  )
}

function ServicePanel() {
  const steps = [
    { icon: <SproutIcon size={22} />, title: 'Ask', text: 'Questions on cooperative law, schemes and loans' },
    { icon: <ShieldIcon size={22} />, title: 'Verify', text: 'Answers cited from official documents' },
    { icon: <BarnIcon size={22} />, title: 'Connect', text: 'Find your PACS and its services' },
    { icon: <ScaleIcon size={22} />, title: 'Resolve', text: 'Track every grievance to closure' },
  ]
  return (
    <div className="mt-4 w-full max-w-md rounded-2xl border border-[#C6D3DA] bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between border-b border-soil-100 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-leaf-700">How Mitra works</p>
        <span className="rounded-full border border-[#B7DDD7] bg-leaf-50 px-2.5 py-0.5 text-[11px] font-semibold text-leaf-700">4 steps</span>
      </div>
      <ol className="relative mt-3 space-y-2.5">
        <span className="absolute bottom-5 left-[19px] top-5 w-px bg-[#C6D3DA]" aria-hidden="true" />
        {steps.map((st, i) => (
          <li key={st.title} className="relative flex items-center gap-3">
            <span className="icon-tile relative z-10 h-10 w-10 shrink-0 bg-white">{st.icon}</span>
            <div className="min-w-0 flex-1 rounded-xl border border-soil-100 bg-wheat-50 px-3 py-1.5">
              <p className="text-[13px] font-bold text-soil-900">
                <span className="mr-1.5 text-leaf-600">0{i + 1}</span>{st.title}
              </p>
              <p className="truncate text-xs text-soil-700/80">{st.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
