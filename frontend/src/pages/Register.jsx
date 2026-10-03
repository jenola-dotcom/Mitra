import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { roleHome } from '../components/ProtectedRoute'
import { TN_DISTRICTS, districtLabel } from '../constants/districts'

const ROLES = [
  { value: 'farmer', labelKey: 'auth.roleFarmer' },
  { value: 'official', labelKey: 'auth.roleOfficial' },
  { value: 'admin', labelKey: 'auth.roleAdmin' },
]

const INDIAN_STATES = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'Bihar',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Odisha',
]

export default function Register() {
  const { register } = useAuth()
  const { t, language, languages } = useLanguage()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    phone: '',
    state: 'Tamil Nadu',
    district: 'Madurai',
    preferredLanguage: language,
    designation: '',
    pacsSociety: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.role === 'official' && !form.designation.trim()) {
      setError('Please enter your designation.')
      return
    }

    setSubmitting(true)

    try {
      const profile = await register(form)
      navigate(roleHome(profile.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-leaf-50 px-4 py-2">
      <div className="relative z-10 flex max-h-full w-full max-w-3xl flex-col">

        {/* Header */}
        <div className="mb-2 flex shrink-0 items-center justify-between">
          <Link to="/login" className="flex items-center gap-2">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-leaf-600 text-lg font-extrabold text-white shadow-sm">
              M
            </div>

            <span className="font-display text-lg font-bold text-leaf-700">
              {t('appName')}
            </span>
          </Link>

          <LanguageSwitcher compact />
        </div>

        {/* Registration Card */}
        <div className="card min-h-0 overflow-y-auto p-4 shadow-soft sm:p-5">

          {/* Title */}
          <div className="mb-3">
            <h2 className="font-display text-xl font-bold text-soil-900 sm:text-2xl">
              {t('auth.registerTitle')}
            </h2>

            <p className="text-xs text-soil-700/90 sm:text-sm">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-3 grid gap-x-3 gap-y-2.5 sm:grid-cols-2"
          >

            {/* Role */}
            <div className="sm:col-span-2">
              <label className="label">
                {t('auth.role')}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        role: r.value,
                      }))
                    }
                    className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition-colors ${
                      form.role === r.value
                        ? 'border-leaf-600 bg-leaf-100 text-leaf-700 shadow-sm'
                        : 'border-soil-200 bg-white text-soil-700 hover:border-sun-400 hover:bg-sun-50'
                    }`}
                  >
                    {t(r.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="label" htmlFor="name">
                {t('auth.fullName')}
              </label>

              <input
                id="name"
                required
                className="input-field"
                value={form.name}
                onChange={update('name')}
                placeholder="Murugan Selvam"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="email">
                {t('auth.email')}
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input-field"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label" htmlFor="phone">
                {t('auth.phone')}
              </label>

              <input
                id="phone"
                type="tel"
                pattern="[0-9]{10}"
                className="input-field"
                value={form.phone}
                onChange={update('phone')}
                placeholder="9600000000"
              />
            </div>

            {/* State + District */}
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <div>
                <label className="label" htmlFor="state">
                  {t('auth.state')}
                </label>

                <select
                  id="state"
                  className="input-field"
                  value={form.state}
                  onChange={update('state')}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="district">
                  {t('auth.district')}
                </label>

                <select
                  id="district"
                  className="input-field"
                  value={form.district}
                  onChange={update('district')}
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.en}>
                      {districtLabel(d.id, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="label" htmlFor="preferredLanguage">
                {t('auth.preferredLanguage')}
              </label>

              <select
                id="preferredLanguage"
                className="input-field"
                value={form.preferredLanguage}
                onChange={update('preferredLanguage')}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Official Designation */}
            {form.role === 'official' && (
              <div>
                <label className="label" htmlFor="designation">
                  {t('auth.designation')}
                </label>

                <input
                  id="designation"
                  required
                  className="input-field"
                  value={form.designation}
                  onChange={update('designation')}
                  placeholder={t('auth.designationPlaceholder')}
                />
              </div>
            )}

            {/* PACS Society */}
            {form.role === 'farmer' && (
              <div>
                <label className="label" htmlFor="pacsSociety">
                  {t('auth.pacsSociety')}
                </label>

                <input
                  id="pacsSociety"
                  className="input-field"
                  value={form.pacsSociety}
                  onChange={update('pacsSociety')}
                  placeholder={t('auth.pacsSocietyPlaceholder')}
                />

                <p className="mt-1.5 text-xs text-soil-700/70">
                  {t('auth.pacsSocietyHint')}
                </p>
              </div>
            )}

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <div>
                <label className="label" htmlFor="password">
                  {t('auth.password')}
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="input-field"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="label" htmlFor="confirmPassword">
                  {t('auth.confirmPassword')}
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="input-field"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="sm:col-span-2 rounded-xl border-2 border-alert-500/40 bg-alert-50 px-3.5 py-2.5 text-sm text-alert-600"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:col-span-2"
            >
              {submitting
                ? t('auth.registering')
                : t('auth.register')}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-3 text-center text-sm text-soil-700/90">
            {t('auth.haveAccount')}{' '}

            <Link
              to="/login"
              className="font-bold text-leaf-600 hover:text-leaf-700"
            >
              {t('auth.signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}