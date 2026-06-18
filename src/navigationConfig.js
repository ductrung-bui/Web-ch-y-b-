/** Menu chính (header Teleport) — đồng bộ App.jsx */
export const MAIN_NAV_ITEMS = [
  { label: 'Trang chủ', path: '/trang-chu' },
  { label: 'Giới thiệu', path: '/gioi-thieu' },
  { label: 'Kinh nghiệm', path: '/kinh-nghiem' },
  { label: 'Lịch trong tháng', path: '/lich-trong-thang' },
  { label: 'Lịch sử chuyến đi', path: '/lich-su-chuyen-di', requiresAuth: true },
  { label: 'Vé của tôi', path: '/ve-cua-toi', requiresAuth: true },
]

/** Sidebar tài khoản (vé / lịch sử / đổi MK) */
export const ACCOUNT_SIDEBAR_ITEMS = [
  { label: 'Thông tin tài khoản', path: '/thay-doi-mat-khau', match: ['/thay-doi-mat-khau'] },
  { label: 'Vé đã đặt', path: '/ve-cua-toi', match: ['/ve-cua-toi', '/ve-da-huy'] },
  { label: 'Lịch sử chuyến đi', path: '/lich-su-chuyen-di', match: ['/lich-su-chuyen-di'] },
]

/** Các bước đặt vé */
export const BOOKING_SLUGS = new Set([
  'manhinhchonthoigianchuyendi',
  'manhinhchonvitrighengoi',
  'dichvubosung',
  'manhinhdienthongtin',
  'manhinhthanhtoan',
])

export const BOOKING_FLOW = {
  manhinhchonthoigianchuyendi: {
    path: '/chon-thoi-gian-chuyen-di',
    back: null,
    next: '/chon-vi-tri-ghe',
  },
  manhinhchonvitrighengoi: {
    path: '/chon-vi-tri-ghe',
    back: '/chon-thoi-gian-chuyen-di',
    next: '/dich-vu-bo-sung',
  },
  dichvubosung: {
    path: '/dich-vu-bo-sung',
    back: '/chon-vi-tri-ghe',
    next: '/dien-thong-tin',
  },
  manhinhdienthongtin: {
    path: '/dien-thong-tin',
    back: '/dich-vu-bo-sung',
    next: '/thanh-toan',
  },
  manhinhthanhtoan: {
    path: '/thanh-toan',
    back: '/dien-thong-tin',
    next: null,
  },
}

export const TICKET_TABS = [
  { label: 'Hiện tại', path: '/ve-cua-toi' },
  { label: 'Đã hủy', path: '/ve-da-huy' },
]
