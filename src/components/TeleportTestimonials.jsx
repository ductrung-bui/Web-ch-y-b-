import { useEffect, useRef } from 'react'
import { testimonialsApi } from '../api/endpoints.js'
import { TESTIMONIALS_FALLBACK } from '../constants/testimonialsFallback.js'
import { enrichTestimonialsWithAvatars } from '../utils/testimonialAvatars.js'

const CHEVRON_SVG = {
  left: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
  right: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`,
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function isValidAvatarUrl(url) {
  if (!url || typeof url !== 'string') return false
  const t = url.trim()
  if (!t || t === 'null' || t === 'undefined') return false
  if (t.includes('favicon.svg')) return false
  return true
}

function renderStars(rating) {
  const n = Math.min(5, Math.max(0, Number(rating) || 0))
  return Array.from({ length: 5 }, (_, i) => {
    const on = i < n
    return `<span class="home-testimonial-star${on ? ' home-testimonial-star--on' : ''}" aria-hidden="true">★</span>`
  }).join('')
}

function fillTestimonialCard(cardEl, item) {
  const initials = getInitials(item.author_name)
  const hasPhoto = isValidAvatarUrl(item.avatar_url)

  cardEl.innerHTML = `
    <div class="home-testimonial-card">
      <div class="home-testimonial-card__avatar">
        ${
          hasPhoto
            ? `<img class="home-testimonial-card__photo" alt="" decoding="async" />`
            : `<span class="home-testimonial-card__initials">${initials}</span>`
        }
      </div>
      <div class="home-testimonial-card__body">
        <div class="home-testimonial-card__stars" role="img" aria-label="${item.rating || 5} sao">
          ${renderStars(item.rating)}
        </div>
        <p class="home-testimonial-card__quote"></p>
        <div class="home-testimonial-card__meta">
          <span class="home-testimonial-card__author BodyBase"></span>
          <span class="home-testimonial-card__trip"></span>
        </div>
      </div>
    </div>
  `

  cardEl.querySelector('.home-testimonial-card__quote').textContent = item.quote || ''
  cardEl.querySelector('.home-testimonial-card__author').textContent = item.author_name || ''
  const tripEl = cardEl.querySelector('.home-testimonial-card__trip')
  if (item.trip_title) {
    tripEl.textContent = item.trip_title
  } else {
    tripEl.remove()
  }

  if (hasPhoto) {
    const img = cardEl.querySelector('.home-testimonial-card__photo')
    const avatar = cardEl.querySelector('.home-testimonial-card__avatar')
    img.src = item.avatar_url.trim()
    img.onerror = () => {
      img.remove()
      const span = document.createElement('span')
      span.className = 'home-testimonial-card__initials'
      span.textContent = initials
      avatar.appendChild(span)
    }
  }
}

function setChevronButton(btn, side) {
  if (!btn) return
  btn.innerHTML = CHEVRON_SVG[side]
  btn.setAttribute('type', 'button')
  btn.setAttribute('aria-label', side === 'left' ? 'Lời khen trước' : 'Lời khen sau')
}

function wireChevrons(section, onPrev, onNext) {
  const prevBtn = section.querySelector('[class*="icon-button-elm1"]')
  const nextBtn = section.querySelector('[class*="icon-button-elm2"]')

  setChevronButton(prevBtn, 'left')
  setChevronButton(nextBtn, 'right')

  const onPrevClick = (e) => {
    e.preventDefault()
    onPrev()
  }
  const onNextClick = (e) => {
    e.preventDefault()
    onNext()
  }

  prevBtn?.addEventListener('click', onPrevClick)
  nextBtn?.addEventListener('click', onNextClick)

  return () => {
    prevBtn?.removeEventListener('click', onPrevClick)
    nextBtn?.removeEventListener('click', onNextClick)
  }
}

/**
 * Gắn carousel lời khen vào khối Teleport trang chủ.
 */
export function TeleportTestimonials() {
  const indexRef = useRef(0)
  const itemsRef = useRef(enrichTestimonialsWithAvatars(TESTIMONIALS_FALLBACK))

  useEffect(() => {
    let cancelled = false
    let cleanupNav = () => {}

    const boot = async () => {
      try {
        const { testimonials } = await testimonialsApi.list()
        if (!cancelled && testimonials?.length) {
          itemsRef.current = enrichTestimonialsWithAvatars(testimonials)
        }
      } catch {
        /* fallback */
      }

      if (cancelled) return

      const page = document.querySelector('.teleport-page--mnhnhtrangch')
      if (!page) return

      const section = page.querySelector('[class*="likhentkhchhng-elm"]')
      const card =
        section?.querySelector('[data-home-testimonial-card]') ||
        section?.querySelector('[class*="khunglikhen-elm"] [class*="card-elm"]')
      if (!section || !card) return

      section.classList.add('home-testimonials-section')
      card.classList.add('home-testimonial-card-host')
      card.querySelector('[class*="image-elm"]')?.remove()

      const show = (idx) => {
        const items = itemsRef.current
        if (!items.length) return
        indexRef.current = ((idx % items.length) + items.length) % items.length
        fillTestimonialCard(card, items[indexRef.current])
      }

      show(0)
      cleanupNav = wireChevrons(
        section,
        () => show(indexRef.current - 1),
        () => show(indexRef.current + 1),
      )
    }

    boot()

    return () => {
      cancelled = true
      cleanupNav()
    }
  }, [])

  return null
}
