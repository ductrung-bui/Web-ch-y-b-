import { useEffect } from 'react'
import { applyTripCardIcons } from '../utils/tripCardIcons.js'
import { formatTripCardSeatLabels } from '../utils/seatStats.js'
import {
  applyTripCardImageHost,
  applyTripDetailGallery,
  applyTripDetailIcons,
} from '../utils/tripDetailImages.js'
import { formatTripPrice, normalizeTripTitle } from '../utils/dataText.js'

function setHostText(host, text) {
  if (!host) return
  const span = host.querySelector('span') || host
  span.textContent = text ?? ''
}

/**
 * Giữ nguyên từng ô HTML/CSS Teleport (class elm10, elm11, …).
 * Chỉ ẩn ô thừa và ẩn hàng không còn thẻ — không clone một template chung.
 */
function fillSlotsInPlace(root, { itemSelector, rowSelector, items, fillItem }) {
  const cards = [...root.querySelectorAll(itemSelector)]

  cards.forEach((card, index) => {
    if (index < items.length) {
      card.style.display = ''
      card.hidden = false
      fillItem(card, items[index], index)
    } else {
      card.style.display = 'none'
      card.hidden = true
      delete card.dataset.tripId
      delete card.dataset.tripSlug
      delete card.dataset.articleSlug
      card.classList.remove('home-trip-card')
      card.removeAttribute('role')
      card.removeAttribute('tabindex')
      card.removeAttribute('aria-label')
    }
  })

  if (rowSelector) {
    const rows = [...root.querySelectorAll(rowSelector)]
    rows.forEach((row) => {
      const rowCards = [...row.querySelectorAll(itemSelector)]
      const hasVisible = rowCards.some((c) => !c.hidden && c.style.display !== 'none')
      row.style.display = hasVisible ? '' : 'none'
      row.hidden = !hasVisible
    })
  }
}

/** Tag thẻ chuyến đi — tag đầu là danh mục (khớp pill Camping / Giải chạy) */
function buildTripCardTags(trip) {
  const seen = new Set()
  const out = []

  const push = (text) => {
    const t = text?.trim()
    if (!t || seen.has(t)) return
    seen.add(t)
    out.push(t)
  }

  push(trip.duration_label)
  push(trip.category_name)
  push(trip.short_description)
  push(trip.destination)
  push(normalizeTripTitle(trip.title))

  if (out.length === 0) push('Cung đường Trekking đẹp')

  return out.slice(0, 3)
}

function fillTripCard(card, trip, index) {
  const imageHost = card.querySelector('[class*="framenhchuyni-elm"]')
  applyTripCardImageHost(imageHost, trip, index)

  const seatLabels = formatTripCardSeatLabels(trip)
  const bookedHost = card.querySelector('[class*="slng-elm"] [class*="text-elm"] span')
  if (bookedHost) bookedHost.textContent = seatLabels.bookedLabel

  const availHost = card.querySelector('[class*="thigian-elm"] [class*="text-elm"] span')
  if (availHost) availHost.textContent = seatLabels.availableLabel
  setHostText(card.querySelector('[class*="tinv-elm"]'), formatTripPrice(trip.base_price))
  setHostText(card.querySelector('[class*="textaim-elm"]'), normalizeTripTitle(trip.title))

  const tagRows = card.querySelectorAll('[class*="thngtinhpdn-elm"]')
  const tags = buildTripCardTags(trip)
  tagRows.forEach((row, i) => {
    const value = tags[i]?.trim() || ''
    setHostText(row, value)
    row.style.display = value ? '' : 'none'
    row.hidden = !value
  })

  applyTripCardIcons(card)

  card.dataset.tripId = String(trip.id)
  if (trip.slug) card.dataset.tripSlug = String(trip.slug)
  else delete card.dataset.tripSlug

  card.classList.add('home-trip-card')
  card.setAttribute('role', 'link')
  card.setAttribute('tabindex', '0')
  card.setAttribute(
    'aria-label',
    `Xem và đặt vé chuyến ${normalizeTripTitle(trip.title) || 'đi'}`,
  )
  card.style.cursor = 'pointer'
}

function fixStaticTypos(page) {
  page.querySelectorAll('span').forEach((span) => {
    const t = span.textContent
    if (t === 'Lịch tình dự kiến') span.textContent = 'Lịch trình dự kiến'
    if (t.includes('Đồi chè Tâm Châu')) span.textContent = t.replace(/Đồi chè Tâm Châu/g, 'Đồi Chè Tâm Châu')
  })
}

function splitSectionLines(text) {
  if (!text) return []
  return String(text)
    .split(/\r?\n/)
    .flatMap((part) => part.split(/ — | – /))
    .map((s) => s.trim())
    .filter(Boolean)
}

function bindSectionBlock(block, text) {
  const lines = splitSectionLines(text)
  if (!lines.length || !block) return

  const khung = block.closest('[class*="khungnidung-elm"]')
  const template = khung?.querySelector('[class*="nidung-elm"]')
  let hosts = [...block.querySelectorAll('[class*="nidung-elm"]')]

  if (!hosts.length && template) {
    const created = template.cloneNode(true)
    block.appendChild(created)
    hosts = [created]
  }
  if (!hosts.length) return

  lines.forEach((line, i) => {
    let host = hosts[i]
    if (!host) {
      host = hosts[0].cloneNode(true)
      block.appendChild(host)
      hosts.push(host)
    }
    setHostText(host, line)
    host.style.display = ''
    host.hidden = false
  })

  for (let i = lines.length; i < hosts.length; i++) {
    hosts[i].style.display = 'none'
    hosts[i].hidden = true
  }
}

const TRIP_DETAIL_SECTIONS = (trip) => ({
  'Điểm đến': trip.pickup_point || trip.destination,
  'Lịch trình dự kiến': trip.itinerary_summary,
  'Lịch tình dự kiến': trip.itinerary_summary,
  'Mô tả cung đường': trip.route_description,
  'Cần chuẩn bị': trip.preparation_notes,
  'Lưu ý quan trọng': trip.important_notes,
})

function bindTripDetail(page, data) {
  const trip = data?.trip
  if (!trip) return

  fixStaticTypos(page)

  const hero = page.querySelector('[class*="thq-chititchuyni-elm"]')
  if (!hero) return

  const title = normalizeTripTitle(trip.title)
  const titleHost = hero.querySelector('[class*="text-elm102"]')
  if (titleHost) setHostText(titleHost, title)
  if (title) document.title = `${title} | Thế Giới Chạy Bộ`

  const sectionValues = TRIP_DETAIL_SECTIONS(trip)
  const khung = hero.querySelector('[class*="khungnidung-elm"]')
  khung?.querySelectorAll('[class*="chuynngthanhnidung-elm"]').forEach((block) => {
    const label = block
      .querySelector('[class*="thngtin-elm"] span')
      ?.textContent?.trim()
    const value = sectionValues[label]
    if (value) bindSectionBlock(block, value)
  })

  const priceHost = hero.querySelector('[class*="text-elm123"]')
  if (priceHost && trip.base_price != null) {
    const priceText = formatTripPrice(trip.base_price).replace(/\/Vé$/i, '')
    setHostText(priceHost, priceText)
  }

  applyTripDetailGallery(page, trip)

  const relatedRoot = page.querySelector('[class*="frame112-elm"]')
  const relatedTitle = page.querySelector('[class*="thamkhochuyni-elm"]')
  if (relatedRoot && data.relatedTrips?.length) {
    relatedRoot.style.display = ''
    relatedRoot.hidden = false
    if (relatedTitle) {
      relatedTitle.style.display = ''
      relatedTitle.hidden = false
    }
    fillSlotsInPlace(relatedRoot, {
      itemSelector: '[class*="product-info-card"]',
      rowSelector: '[class*="nhngchuyni-elm"]',
      items: data.relatedTrips,
      fillItem: fillTripCard,
    })
  } else if (relatedRoot) {
    relatedRoot.style.display = 'none'
    relatedRoot.hidden = true
    if (relatedTitle) {
      relatedTitle.style.display = 'none'
      relatedTitle.hidden = true
    }
  }
}

function bindSlugData(page, slug, data) {
  fixStaticTypos(page)

  if (slug === 'mnhnhchititchuyni') {
    applyTripDetailIcons(page)
    if (data?.trip) bindTripDetail(page, data)
    return
  }

  if (slug === 'mnhnhtrangch' && data.trips) {
    fillSlotsInPlace(page, {
      itemSelector: '[class*="product-info-card"]',
      rowSelector: '[class*="nhngchuyni-elm"]',
      items: data.trips,
      fillItem: fillTripCard,
    })
    return
  }

}

export function TeleportDynamicBinder({ slug, data, loading }) {
  useEffect(() => {
    if (loading) return
    if (!data && slug !== 'mnhnhchititchuyni') return

    const run = () => {
      const page = document.querySelector(`.teleport-page--${slug}`)
      if (!page) return
      bindSlugData(page, slug, data)
    }

    run()
    const timer = window.setTimeout(run, 0)
    return () => window.clearTimeout(timer)
  }, [slug, data, loading])

  return null
}
