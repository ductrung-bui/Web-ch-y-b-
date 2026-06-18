import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'mountain_booking_draft'

const BookingContext = createContext(null)

function readDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

export function BookingProvider({ children }) {
  const [draft, setDraftState] = useState(readDraft)

  const setDraft = (data) => {
    setDraftState(data)
    if (data) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    else sessionStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      draft,
      bookingId: draft?.bookingId ?? null,
      tripId: draft?.tripId ?? null,
      scheduleId: draft?.scheduleId ?? null,
      setDraft,
      clearDraft: () => setDraft(null),
    }),
    [draft],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be inside BookingProvider')
  return ctx
}
