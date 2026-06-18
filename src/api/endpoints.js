import { api } from './client.js'

export const apiGet = (path) => api(path)
export const apiPost = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) })
export const apiPut = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) })
export const apiDelete = (path) => api(path, { method: 'DELETE' })

/**
 * Map trang React ↔ API ↔ bảng MySQL
 */
export const PAGE_API_MAP = {
  index: { tables: ['content_pages', 'support_contacts'] },
  dangnhap: { action: 'POST /auth/login', tables: ['users', 'user_sessions'] },
  dangky: { action: 'POST /auth/register', tables: ['users'] },
  dangxuat: { action: 'POST /auth/logout', tables: ['user_sessions'] },
  nhapemailkhoiphuc: { action: 'POST /auth/forgot-password', tables: ['password_reset_tokens'] },
  khoiphucmatkhau: { action: 'POST /auth/reset-password', tables: ['password_reset_tokens', 'users'] },
  thaydoimatkhau: {
    action: 'PUT /auth/profile, /auth/avatar, /auth/change-password',
    tables: ['users'],
  },
  mnhnhtrangch: {
    load: 'GET /trips, GET /testimonials',
    tables: ['trips', 'trip_categories', 'customer_testimonials', 'articles'],
  },
  mnhnhchititchuyni: { load: 'GET /trips/:id', tables: ['trips', 'trip_schedules'] },
  manhinhchonthoigianchuyendi: { load: 'GET /trips/:id/schedules', tables: ['trip_schedules'] },
  manhinhchonvitrighengoi: { load: 'GET /schedules/:id/seats', tables: ['seats'] },
  dichvubosung: { load: 'GET /addons', tables: ['addon_services'] },
  manhinhdienthongtin: { action: 'PUT /bookings/:id/passengers', tables: ['passengers'] },
  manhinhthanhtoan: { action: 'POST /bookings/:id/pay', tables: ['payments'] },
  thongtinvedadat: { load: 'GET /bookings/my?status=active', tables: ['bookings'] },
  thongtinvedahuy: { load: 'GET /bookings/my?status=cancelled', tables: ['bookings'] },
  lichsuchuyendi: { load: 'GET /bookings/my?status=history', tables: ['bookings'] },
  lchtrongthng: { load: 'GET /schedules/calendar', tables: ['trip_schedules'] },
  kinhnghim: { load: 'GET /articles', tables: ['articles'] },
}

export const authApi = {
  login: (body) => apiPost('/auth/login', body),
  register: (body) => apiPost('/auth/register', body),
  logout: () => apiPost('/auth/logout', {}),
  me: () => apiGet('/auth/me'),
  forgotPassword: (body) => apiPost('/auth/forgot-password', body),
  resetPassword: (body) => apiPost('/auth/reset-password', body),
  changePassword: (body) => apiPut('/auth/change-password', body),
  updateProfile: (body) => apiPut('/auth/profile', body),
  uploadAvatar: (body) => apiPut('/auth/avatar', body),
  removeAvatar: () => apiDelete('/auth/avatar'),
}

export const tripsApi = {
  list: (params = {}) => {
    const normalizedParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string' && value.trim() === '') return false
        return true
      }),
    )
    const q = new URLSearchParams(normalizedParams).toString()
    return apiGet(`/trips${q ? `?${q}` : ''}`)
  },
  categories: () => apiGet('/trips/categories/list'),
  detail: (id) => apiGet(`/trips/${id}`),
  schedules: (id) => apiGet(`/trips/${id}/schedules`),
}

export const schedulesApi = {
  seats: (scheduleId, bookingId) => {
    const q = bookingId ? `?bookingId=${encodeURIComponent(bookingId)}` : ''
    return apiGet(`/schedules/${scheduleId}/seats${q}`)
  },
  calendar: (month) =>
    apiGet(`/schedules/calendar${month ? `?month=${encodeURIComponent(month)}` : ''}`),
}

export const bookingsApi = {
  mine: (status) => apiGet(`/bookings/my${status ? `?status=${status}` : ''}`),
  get: (id) => apiGet(`/bookings/${id}`),
  create: (body) => apiPost('/bookings', body),
  setSeats: (id, seatIds) => apiPut(`/bookings/${id}/seats`, { seatIds }),
  setAddons: (id, items) => apiPut(`/bookings/${id}/addons`, { items }),
  setPassengers: (id, passengers) => apiPut(`/bookings/${id}/passengers`, { passengers }),
  pay: (id, method) => apiPost(`/bookings/${id}/pay`, { method }),
  cancel: (id, reason) => apiPost(`/bookings/${id}/cancel`, { reason }),
}

export const contentApi = {
  pages: () => apiGet('/content/pages'),
  page: (slug) => apiGet(`/content/pages/${slug}`),
  contacts: () => apiGet('/content/contacts'),
}

export const articlesApi = {
  list: (limit) =>
    apiGet(`/articles${limit ? `?limit=${encodeURIComponent(limit)}` : ''}`),
  get: (slug) => apiGet(`/articles/${slug}`),
}

export const testimonialsApi = {
  list: () => apiGet('/testimonials'),
}

export const addonsApi = {
  list: (tripId) => apiGet(`/addons${tripId ? `?tripId=${tripId}` : ''}`),
}
