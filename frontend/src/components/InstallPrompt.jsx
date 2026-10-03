import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function InstallPrompt() {
  const { t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(
    window.matchMedia?.('(display-mode: standalone)').matches || false
  )

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !deferredPrompt) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <button
      onClick={handleInstall}
      className="inline-flex items-center gap-1.5 rounded-full bg-leaf-600 px-3 py-1.5 text-xs font-medium text-white shadow-soft hover:bg-leaf-700"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V4a1 1 0 011-1zM4 15a1 1 0 011 1v1h10v-1a1 1 0 112 0v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a1 1 0 011-1z" />
      </svg>
      {t('common.installApp')}
    </button>
  )
}
