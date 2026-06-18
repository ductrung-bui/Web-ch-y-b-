import { useEffect } from 'react'
import { getIntroGalleryUrls, resolveIntroHeroUrl } from '../utils/introImages.js'

const GALLERY_CELL_COUNT = 9

function rebuildGallery(host) {
  if (!host) return

  const urls = getIntroGalleryUrls(GALLERY_CELL_COUNT)
  host.classList.add('intro-gallery')
  host.innerHTML = ''

  const grid = document.createElement('div')
  grid.className = 'intro-gallery__grid'
  grid.setAttribute('aria-label', 'Hình ảnh hoạt động')

  urls.forEach((url, index) => {
    const cell = document.createElement('figure')
    cell.className = `intro-gallery__cell intro-gallery__cell--${index + 1}`

    const img = document.createElement('img')
    img.className = 'intro-gallery__img'
    img.src = url
    img.alt = ''
    img.decoding = 'async'
    img.loading = 'lazy'
    img.onerror = () => {
      img.src = '/logo-tgcb.png'
    }

    cell.appendChild(img)
    grid.appendChild(cell)
  })

  host.appendChild(grid)
}

function applyMissionContent(page, data) {
  const pages = data?.pages ?? []
  const heroPage = pages.find((p) => p.slug === 'gioi-thieu')
  const missionPage = pages.find((p) => p.slug === 'su-menh')

  const heroBlock = page.querySelector('[class*="text-content-title-elm1"]')
  const line1 = heroBlock?.querySelector('[class*="text-elm10"]')
  const line2 = heroBlock?.querySelector('[class*="text-elm11"]')

  const missionBlock = page.querySelector('[class*="text-content-title-elm3"]')
  const missionTitle = missionBlock?.querySelector('[class*="text-elm12"]')
  let missionBody = missionBlock?.querySelector('[class*="text-elm13"]')

  if (heroPage?.title && line1) line1.textContent = heroPage.title
  if (line2 && heroPage?.body_html) {
    const plain = heroPage.body_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (plain && !plain.includes('—')) line2.textContent = plain
  }

  if (missionPage?.title && missionTitle) missionTitle.textContent = missionPage.title
  if (missionPage?.body_html && missionBody) {
    const body = document.createElement('div')
    body.className = 'intro-mission__body'
    body.innerHTML = missionPage.body_html
    missionBody.replaceWith(body)
    missionBody = body
  }
}

function bindIntroPage(page, data) {
  if (!page) return

  const hero = page.querySelector('[class*="frame82-elm"]')
  if (hero) {
    hero.classList.add('intro-hero')
    const url = resolveIntroHeroUrl()
    if (url) hero.style.setProperty('background-image', `url("${url}")`)
  }

  const gallery = page.querySelector('[class*="frame85-elm"]')
  rebuildGallery(gallery)

  applyMissionContent(page, data)
}

function runIntroBind(data) {
  document.querySelectorAll('.teleport-page--index').forEach((page) => {
    bindIntroPage(page, data)
  })
}

/**
 * Trang Giới thiệu — hero, Sứ mệnh, gallery ảnh.
 */
export function TeleportIntroBinder({ data, loading }) {
  useEffect(() => {
    if (loading) return undefined

    const t = window.requestAnimationFrame(() => {
      runIntroBind(data)
    })

    return () => window.cancelAnimationFrame(t)
  }, [data, loading])

  return null
}
