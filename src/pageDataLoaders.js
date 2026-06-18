import {
  articlesApi,
  bookingsApi,
  contentApi,
  tripsApi,
  schedulesApi,
  addonsApi,
} from './api/endpoints.js'

export const PAGE_DATA_LOADERS = {
  index: async () => {
    const [pages, contacts] = await Promise.all([contentApi.pages(), contentApi.contacts()])
    return { pages: pages.pages, contacts: contacts.contacts }
  },
  mnhnhtrangch: async (params) => {
    const category = params.get('category')
    const [{ trips }, { categories }] = await Promise.all([
      tripsApi.list({
        category: category && category !== 'all' ? category : undefined,
        q: params.get('q') || undefined,
      }),
      tripsApi.categories(),
    ])
    return { trips, categories }
  },
  mnhnhchititchuyni: async (params) => {
    const id = params.get('tripId') || params.get('id')
    if (!id) return { trip: null, schedules: [], relatedTrips: [] }
    const [detail, list] = await Promise.all([tripsApi.detail(id), tripsApi.list()])
    const currentId = detail?.trip?.id
    const relatedTrips = (list?.trips || []).filter((t) => t.id !== currentId)
    return { ...detail, relatedTrips }
  },
  manhinhchonthoigianchuyendi: async (params) => {
    const tripId = params.get('tripId')
    if (!tripId) return { trip: null, schedules: [] }
    const detail = await tripsApi.detail(tripId)
    return { trip: detail.trip, schedules: detail.schedules || [] }
  },
  manhinhchonvitrighengoi: async (params) => {
    const scheduleId = params.get('scheduleId')
    if (!scheduleId) return { seats: [] }
    const bookingId = params.get('bookingId') || undefined
    return schedulesApi.seats(scheduleId, bookingId)
  },
  dichvubosung: async (params) => {
    const tripId = params.get('tripId')
    return addonsApi.list(tripId)
  },
  thongtinvedadat: async () => bookingsApi.mine('active'),
  thongtinvedahuy: async () => bookingsApi.mine('cancelled'),
  lichsuchuyendi: async () => bookingsApi.mine('history'),
  lchtrongthng: async (params) =>
    schedulesApi.calendar(params.get('month') || undefined),
}

export const DYNAMIC_LIST_SLUGS = new Set(['mnhnhtrangch'])

/** Trang có loader API nhưng không phải danh sách clone */
export const DYNAMIC_DETAIL_SLUGS = new Set(['mnhnhchititchuyni'])
