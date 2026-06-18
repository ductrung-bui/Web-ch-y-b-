import { resolveArticleCoverUrl } from './articleImages.js'

export function normalizeArticleText(text) {
  return String(text || '')
    .replace(/DCX/g, 'Thế Giới Chạy Bộ')
    .trim()
}

export function fillArticleCard(card, article, index = 0) {
  const coverHost = card.querySelector('[class*="section-elm"]')
  if (coverHost) {
    const imageUrl = resolveArticleCoverUrl(article, index)
    coverHost.style.backgroundImage = `url("${imageUrl}")`
    coverHost.style.backgroundPosition = 'center'
    coverHost.style.backgroundSize = 'cover'
    coverHost.style.backgroundRepeat = 'no-repeat'
    coverHost.style.backgroundColor = 'transparent'
  }

  const content = card.querySelector('[class*="nidungbivitmi-elm"]')
  if (!content) return

  const titleBlock = content.children[0]
  const dateBlock = content.children[1]
  const excerptBlock = content.children[2]

  const titleSpan = titleBlock?.querySelector('span')
  const dateSpan = dateBlock?.querySelector('span')
  const excerptSpan = excerptBlock?.querySelector('span')

  titleBlock?.classList.add('home-article-card__title-wrap')
  if (titleSpan) {
    titleSpan.classList.add('home-article-card__title')
    titleSpan.textContent = article.title || ''
  }
  if (dateSpan) {
    dateSpan.textContent = article.published_at
      ? new Date(article.published_at).toLocaleDateString('vi-VN')
      : 'Chưa có ngày'
  }
  if (excerptSpan) {
    excerptSpan.textContent = normalizeArticleText(article.excerpt || article.summary)
  }

  const calImg = card.querySelector('[class*="frame114-elm"] img')
  if (calImg) calImg.src = '/icons/trip-calendar.svg'

  if (article.slug) {
    card.dataset.articleSlug = String(article.slug)
    card.style.cursor = 'pointer'
  }
}

export function bindArticleCardClicks(root, navigate, { articleParam = 'bai' } = {}) {
  root.querySelectorAll('[class*="bivitmivkinhnghim-elm"][data-article-slug]').forEach((card) => {
    const slug = card.dataset.articleSlug
    if (!slug) return

    if (card._articleNavHandler) {
      card.removeEventListener('click', card._articleNavHandler)
      card._articleNavHandler = null
    }

    const handler = () => {
      navigate(`/kinh-nghiem?${articleParam}=${encodeURIComponent(slug)}`)
    }
    card._articleNavHandler = handler
    card.addEventListener('click', handler)
  })
}

const EMPTY_CARD_CLASS = 'article-card-slot--empty'

export function fillArticleSlots(root, items, fillItem = fillArticleCard) {
  const cards = [...root.querySelectorAll('[class*="bivitmivkinhnghim-elm"]')]
  cards.forEach((card, index) => {
    if (index < items.length) {
      card.classList.remove(EMPTY_CARD_CLASS)
      card.hidden = false
      card.style.removeProperty('display')
      fillItem(card, items[index], index)
    } else {
      card.classList.add(EMPTY_CARD_CLASS)
      card.hidden = true
      delete card.dataset.articleSlug
      delete card.style.cursor
      if (card._articleNavHandler) {
        card.removeEventListener('click', card._articleNavHandler)
        card._articleNavHandler = null
      }
    }
  })
}

/** Ẩn hàng list Figma khi không còn card nào (tránh 3 block placeholder giống nhau) */
export function syncArticleListRows(listArea) {
  if (!listArea) return
  listArea.querySelectorAll('[class*="bivitkinhnghim-elm"]').forEach((row) => {
    const hasCard = [...row.querySelectorAll('[class*="bivitmivkinhnghim-elm"]')].some(
      (card) => !card.classList.contains(EMPTY_CARD_CLASS),
    )
    row.hidden = !hasCard
    row.style.display = hasCard ? '' : 'none'
  })
}
