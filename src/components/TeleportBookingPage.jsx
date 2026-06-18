import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { ConnectedPage } from './ConnectedPage.jsx'
import { useBooking } from '../context/BookingContext.jsx'

/**
 * Trang booking Teleport — gộp ?tripId= từ URL với draft trong session.
 */
export function TeleportBookingPage({ slug, html }) {
  const [params] = useSearchParams()
  const { tripId, scheduleId, bookingId } = useBooking()

  const queryDefaults = useMemo(() => {
    const defaults = {}
    const trip = params.get('tripId') || tripId
    const schedule = params.get('scheduleId') || scheduleId
    const booking = params.get('bookingId') || bookingId
    if (trip) defaults.tripId = String(trip)
    if (schedule) defaults.scheduleId = String(schedule)
    if (booking) defaults.bookingId = String(booking)
    return defaults
  }, [params.toString(), tripId, scheduleId, bookingId])

  const key = [queryDefaults.tripId, queryDefaults.scheduleId, queryDefaults.bookingId]
    .filter(Boolean)
    .join('-')

  return (
    <ConnectedPage
      key={key || slug}
      html={html}
      slug={slug}
      queryDefaults={queryDefaults}
    />
  )
}
