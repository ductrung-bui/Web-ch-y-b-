import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext.jsx'
import {
  isHomeTripCard,
  readTripTargetFromCard,
  tripDetailPath,
} from '../utils/tripCardNav.js'

const TRIP_CARD_PAGES = '.teleport-page--mnhnhtrangch, .teleport-page--mnhnhchititchuyni'

/**
 * Click thẻ chuyến đi (trang chủ + chi tiết) → đúng trang /chuyen-di/:slug.
 */
export function TeleportTripCardBinder() {
  const navigate = useNavigate()
  const { clearDraft, setDraft } = useBooking()

  useEffect(() => {
    const goToTrip = (card) => {
      const target = readTripTargetFromCard(card)
      if (!target) return

      clearDraft()
      setDraft({
        tripId: target.tripId,
        ...(target.slug ? { tripSlug: target.slug } : {}),
      })
      const path = tripDetailPath(
        target.slug ? { slug: target.slug, id: target.tripId } : target.tripId,
      )
      navigate({ pathname: path, search: '' })
    }

    const onClick = (e) => {
      const card = e.target.closest('.home-trip-card')
      if (!card || !isHomeTripCard(card)) return
      if (!card.closest(TRIP_CARD_PAGES)) return
      if (card.hidden || card.style.display === 'none') return

      e.preventDefault()
      e.stopPropagation()
      goToTrip(card)
    }

    const onKeyDown = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const card = e.target.closest('.home-trip-card')
      if (!card || !isHomeTripCard(card)) return
      if (!card.closest(TRIP_CARD_PAGES)) return
      if (card.hidden || card.style.display === 'none') return

      e.preventDefault()
      goToTrip(card)
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [navigate, clearDraft, setDraft])

  return null
}

/** @deprecated dùng TeleportTripCardBinder */
export const TeleportHomeTripBinder = TeleportTripCardBinder
