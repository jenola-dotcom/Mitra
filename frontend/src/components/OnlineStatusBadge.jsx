import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function OnlineStatusBadge() {
  const { t } = useLanguage()
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        online ? 'border-[#B7DDD7] bg-leaf-50 text-leaf-700' : 'border-alert-500/20 bg-alert-50 text-alert-600'
      }`}
      title={online ? t('common.online') : t('common.offline')}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-leaf-600' : 'bg-alert-500'}`} />
      {online ? t('common.online') : t('common.offline')}
    </span>
  )
}
