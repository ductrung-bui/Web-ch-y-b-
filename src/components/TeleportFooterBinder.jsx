import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { contentApi } from '../api/endpoints.js'
import { bindSiteFooter } from '../utils/footerBinder.js'

/**
 * Footer dùng chung — layout, icon, liên hệ từ API, menu liên kết.
 */
export function TeleportFooterBinder() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      let contacts = []
      try {
        const res = await contentApi.contacts()
        contacts = res.contacts ?? []
      } catch {
        contacts = []
      }

      if (cancelled) return

      document.querySelectorAll('.teleport-page').forEach((page) => {
        page.querySelectorAll('[class*="footer-elm"]').forEach((footer) => {
          delete footer.dataset.footerBound
        })
        bindSiteFooter(page, contacts, { navigate })
      })
    }

    const schedule = () => {
      if (!cancelled) void run()
    }

    schedule()
    const t = window.setTimeout(schedule, 0)
    const t2 = window.setTimeout(schedule, 150)

    return () => {
      cancelled = true
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [location.pathname, navigate])

  return null
}
