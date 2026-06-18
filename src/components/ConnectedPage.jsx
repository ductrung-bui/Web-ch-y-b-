import { lazy, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TeleportPage } from './TeleportPage.jsx'
import { TeleportNavBinder } from './TeleportNavBinder.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  DYNAMIC_DETAIL_SLUGS,
  DYNAMIC_LIST_SLUGS,
  PAGE_DATA_LOADERS,
} from '../pageDataLoaders.js'
import { BOOKING_SLUGS } from '../navigationConfig.js'

const TeleportDynamicBinder = lazy(() =>
  import('./TeleportDynamicBinder.jsx').then((m) => ({ default: m.TeleportDynamicBinder })),
)
const TeleportHomeControls = lazy(() =>
  import('./TeleportHomeControls.jsx').then((m) => ({ default: m.TeleportHomeControls })),
)
const TeleportTripCardBinder = lazy(() =>
  import('./TeleportTripCardBinder.jsx').then((m) => ({ default: m.TeleportTripCardBinder })),
)
const TeleportTestimonials = lazy(() =>
  import('./TeleportTestimonials.jsx').then((m) => ({ default: m.TeleportTestimonials })),
)
const TeleportHomeArticles = lazy(() =>
  import('./TeleportHomeArticles.jsx').then((m) => ({ default: m.TeleportHomeArticles })),
)
const TeleportKinhnghimArticles = lazy(() =>
  import('./TeleportKinhnghimArticles.jsx').then((m) => ({ default: m.TeleportKinhnghimArticles })),
)
const TeleportIntroBinder = lazy(() =>
  import('./TeleportIntroBinder.jsx').then((m) => ({ default: m.TeleportIntroBinder })),
)
const TeleportCalendarBinder = lazy(() =>
  import('./TeleportCalendarBinder.jsx').then((m) => ({ default: m.TeleportCalendarBinder })),
)
const TeleportHistoryBinder = lazy(() =>
  import('./TeleportHistoryBinder.jsx').then((m) => ({ default: m.TeleportHistoryBinder })),
)
const TeleportAccountBinder = lazy(() =>
  import('./TeleportAccountBinder.jsx').then((m) => ({ default: m.TeleportAccountBinder })),
)
const TeleportTicketsBinder = lazy(() =>
  import('./TeleportTicketsBinder.jsx').then((m) => ({ default: m.TeleportTicketsBinder })),
)
const TeleportBookingBinder = lazy(() =>
  import('./TeleportBookingBinder.jsx').then((m) => ({ default: m.TeleportBookingBinder })),
)
const TeleportAuthBinder = lazy(() =>
  import('./TeleportAuthBinder.jsx').then((m) => ({ default: m.TeleportAuthBinder })),
)

const AUTH_SLUGS = new Set([
  'dangnhap',
  'dangky',
  'dangxuat',
  'nhapemailkhoiphuc',
  'khoiphucmatkhau',
])

const NEEDS_AUTH = new Set([
  'thongtinvedadat',
  'thongtinvedahuy',
  'lichsuchuyendi',
  'thaydoimatkhau',
  'manhinhdienthongtin',
  'manhinhthanhtoan',
])

/**
 * Trang Teleport + API.
 * HTML tĩnh giữ nguyên layout; các vùng danh sách được thay bằng dữ liệu MySQL.
 */
export function ConnectedPage({ slug, html, queryDefaults = {} }) {
  const [params] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(PAGE_DATA_LOADERS[slug]))
  const loader = PAGE_DATA_LOADERS[slug]
  const needsAuth = NEEDS_AUTH.has(slug)
  const hasDynamicList = DYNAMIC_LIST_SLUGS.has(slug)
  const hasDynamicDetail = DYNAMIC_DETAIL_SLUGS.has(slug)
  const needsDataBinder = hasDynamicList || hasDynamicDetail

  useEffect(() => {
    if (!loader) {
      setLoading(false)
      return
    }
    if (needsAuth && !isAuthenticated) {
      setData(null)
      setLoading(false)
      return
    }

    const merged = new URLSearchParams(params)
    for (const [key, value] of Object.entries(queryDefaults)) {
      if (value != null && value !== '') {
        merged.set(key, String(value))
      }
    }

    setLoading(true)
    loader(merged)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [
    slug,
    params.toString(),
    isAuthenticated,
    loader,
    needsAuth,
    queryDefaults?.tripId,
    queryDefaults?.scheduleId,
    queryDefaults?.bookingId,
  ])

  if (AUTH_SLUGS.has(slug)) {
    return (
      <div className={`auth-page auth-page--${slug}`}>
        <TeleportPage html={html} slug={slug} />
        <TeleportNavBinder slug={slug} />
        <Suspense fallback={null}>
          {(slug === 'dangnhap' ||
            slug === 'dangky' ||
            slug === 'nhapemailkhoiphuc' ||
            slug === 'khoiphucmatkhau') && <TeleportAuthBinder slug={slug} />}
        </Suspense>
      </div>
    )
  }

  return (
    <>
      <TeleportPage html={html} slug={slug} />
      <TeleportNavBinder slug={slug} />
      <Suspense fallback={null}>
        {slug === 'mnhnhtrangch' && <TeleportHomeControls />}
        {(slug === 'mnhnhtrangch' || slug === 'mnhnhchititchuyni') && <TeleportTripCardBinder />}
        {slug === 'mnhnhtrangch' && <TeleportTestimonials />}
        {slug === 'mnhnhtrangch' && <TeleportHomeArticles />}
        {slug === 'kinhnghim' && <TeleportKinhnghimArticles />}
        {slug === 'lchtrongthng' && (
          <TeleportCalendarBinder data={data} loading={loading} />
        )}
        {slug === 'lichsuchuyendi' && (
          <TeleportHistoryBinder data={data} loading={loading} />
        )}
        {slug === 'thaydoimatkhau' && <TeleportAccountBinder />}
        {(slug === 'thongtinvedadat' || slug === 'thongtinvedahuy') && (
          <TeleportTicketsBinder slug={slug} data={data} loading={loading} />
        )}
        {slug === 'index' && <TeleportIntroBinder data={data} loading={loading} />}
        {needsDataBinder && (
          <TeleportDynamicBinder slug={slug} data={data} loading={loading} />
        )}
        {BOOKING_SLUGS.has(slug) && (
          <TeleportBookingBinder slug={slug} data={data} loading={loading} />
        )}
      </Suspense>
    </>
  )
}
