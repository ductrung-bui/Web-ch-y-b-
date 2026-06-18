export const BOOKING_STEP_DEFS = [
  {
    label: 'Chọn thời gian',
    slug: 'manhinhchonthoigianchuyendi',
    icon: '/icons/trip-calendar.svg',
  },
  {
    label: 'Chọn vị trí ghế',
    slug: 'manhinhchonvitrighengoi',
    icon: '/icons/booking-seat.svg',
  },
  {
    label: 'Dịch vụ bổ sung',
    slug: 'dichvubosung',
    icon: '/icons/booking-addon.svg',
  },
  {
    label: 'Thông tin',
    slug: 'manhinhdienthongtin',
    icon: '/icons/trip-user.svg',
  },
  {
    label: 'Thanh toán',
    slug: 'manhinhthanhtoan',
    icon: '/icons/trip-ticket.svg',
  },
]

const STEP_COL_SELECTOR =
  '[class*="frame137-elm"], [class*="frame138-elm"], [class*="frame139-elm"], [class*="frame141-elm"], [class*="frame140-elm"]'

const CHECK_ICON = '/icons/booking-step-check.svg'

function findStepColumn(bar, label) {
  const span = [...bar.querySelectorAll('span')].find((s) => s.textContent.trim() === label)
  return span?.closest(STEP_COL_SELECTOR) || null
}

function ensureStepIcon(circle) {
  const existingCheck = circle.querySelector('[class*="check-elm"]')
  if (existingCheck) {
    existingCheck.classList.add('booking-step-icon')
    return existingCheck
  }

  let icon = circle.querySelector('.booking-step-icon')
  if (!icon) {
    icon = document.createElement('img')
    icon.className = 'booking-step-icon'
    icon.alt = ''
    circle.appendChild(icon)
  }
  return icon
}

/** Gắn icon vào 5 ô bước đặt vé + trạng thái hoàn thành / đang chọn */
export function bindBookingSteps(page, currentSlug) {
  const bar = page.querySelector('[class*="frame142-elm"]')
  if (!bar) return

  bar.classList.add('booking-steps-bar')

  const currentIndex = BOOKING_STEP_DEFS.findIndex((s) => s.slug === currentSlug)

  BOOKING_STEP_DEFS.forEach((step, index) => {
    const col = findStepColumn(bar, step.label)
    if (!col) return

    const circle = col.querySelector('[class*="frames-elm"]')
    if (!circle) return

    col.classList.remove('booking-step--active', 'booking-step--done', 'booking-step--pending')
    circle.classList.remove(
      'booking-step-circle--active',
      'booking-step-circle--done',
      'booking-step-circle--pending',
    )

    circle.querySelectorAll(':scope > div[class*="text-elm"]').forEach((el) => {
      el.style.display = 'none'
    })

    const icon = ensureStepIcon(circle)
    const done = currentIndex >= 0 && index < currentIndex
    const active = index === currentIndex

    if (done) {
      col.classList.add('booking-step--done')
      circle.classList.add('booking-step-circle--done')
      icon.src = CHECK_ICON
      icon.classList.add('booking-step-icon--check')
    } else if (active) {
      col.classList.add('booking-step--active')
      circle.classList.add('booking-step-circle--active')
      icon.src = step.icon
      icon.classList.remove('booking-step-icon--check')
    } else {
      col.classList.add('booking-step--pending')
      circle.classList.add('booking-step-circle--pending')
      icon.src = step.icon
      icon.classList.remove('booking-step-icon--check')
    }
  })
}
