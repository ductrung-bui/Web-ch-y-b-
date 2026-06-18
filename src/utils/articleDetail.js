import { articlesApi } from '../api/endpoints.js'
import { normalizeArticleText } from './articleCard.js'
import { resolveArticleCoverUrl } from './articleImages.js'

const DETAIL_CLASS = 'kinhnghim-article-detail'
const DETAIL_HOST_ATTR = 'data-kinhnghim-detail-host'

export function getArticleSlugFromParams(params) {
  return (params.get('bai') || params.get('slug') || '').trim()
}

function formatArticleDate(value) {
  if (!value) return 'Chưa có ngày'
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function isMinimalArticleHtml(html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return !text || text.length < 80
}

function buildArticleBodyHtml(article) {
  const raw = String(article?.content_html || '').trim()
  if (raw && raw !== '<p></p>' && !isMinimalArticleHtml(raw)) {
    return raw.replace(/DCX/g, 'Thế Giới Chạy Bộ')
  }

  const excerpt = normalizeArticleText(article?.excerpt || '')
  const parts = excerpt
    .split(/\n{2,}|\. (?=[A-ZÀ-Ỵ])/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length) {
    return parts.map((p) => `<p>${p}${p.endsWith('.') ? '' : '.'}</p>`).join('')
  }

  return '<p>Nội dung bài viết đang được cập nhật.</p>'
}

function ensureDetailHost(pageEl) {
  let host = pageEl.querySelector(`[${DETAIL_HOST_ATTR}]`)
  if (host) return host

  const mount = pageEl.querySelector('[class*="cmnangleoni-elm"]')
  if (!mount) return null

  host = document.createElement('section')
  host.setAttribute(DETAIL_HOST_ATTR, '1')
  host.className = DETAIL_CLASS
  host.hidden = true
  host.innerHTML = `
    <button type="button" class="kinhnghim-article-detail__back">← Quay lại danh sách</button>
    <article class="kinhnghim-article-detail__card">
      <div class="kinhnghim-article-detail__hero" role="img" aria-hidden="true"></div>
      <header class="kinhnghim-article-detail__header">
        <h1 class="kinhnghim-article-detail__title"></h1>
        <p class="kinhnghim-article-detail__meta">
          <img src="/icons/trip-calendar.svg" alt="" width="18" height="18" />
          <time></time>
          <span class="kinhnghim-article-detail__author"></span>
        </p>
      </header>
      <div class="kinhnghim-article-detail__body"></div>
    </article>
  `
  mount.appendChild(host)
  return host
}

export function setKinhnghimListVisible(pageEl, visible) {
  const listBlocks = pageEl.querySelectorAll(
    '[class*="bivitkinhnghim-elm1"], [class*="bivitkinhnghim-elm2"], [class*="bivitkinhnghim-elm3"]',
  )
  const pagination = pageEl.querySelector('[class*="articles-pagination-host"]')

  listBlocks.forEach((el) => {
    el.style.display = visible ? '' : 'none'
  })
  if (pagination) pagination.style.display = visible ? '' : 'none'

  pageEl.classList.toggle('kinhnghim--detail-open', !visible)
}

export function bindArticleDetailBack(host, onBack) {
  const btn = host?.querySelector('.kinhnghim-article-detail__back')
  if (!btn || btn.dataset.bound === '1') return () => {}
  btn.dataset.bound = '1'
  const handler = (e) => {
    e.preventDefault()
    onBack()
  }
  btn.addEventListener('click', handler)
  return () => btn.removeEventListener('click', handler)
}

export function renderArticleDetail(pageEl, article) {
  const host = ensureDetailHost(pageEl)
  if (!host || !article) return null

  const coverUrl = resolveArticleCoverUrl(article, 0)
  const hero = host.querySelector('.kinhnghim-article-detail__hero')
  const titleEl = host.querySelector('.kinhnghim-article-detail__title')
  const timeEl = host.querySelector('time')
  const authorEl = host.querySelector('.kinhnghim-article-detail__author')
  const bodyEl = host.querySelector('.kinhnghim-article-detail__body')

  if (hero) {
    hero.style.backgroundImage = `url("${coverUrl}")`
    hero.setAttribute('aria-label', article.title || 'Ảnh bài viết')
  }
  if (titleEl) titleEl.textContent = article.title || ''
  if (timeEl) {
    timeEl.dateTime = article.published_at || ''
    timeEl.textContent = formatArticleDate(article.published_at)
  }
  if (authorEl) {
    const author = article.author_name?.trim()
    authorEl.textContent = author ? ` · ${author}` : ''
    authorEl.hidden = !author
  }
  if (bodyEl) {
    bodyEl.innerHTML = buildArticleBodyHtml(article)
  }

  host.hidden = false
  setKinhnghimListVisible(pageEl, false)
  host.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return host
}

export function hideArticleDetail(pageEl) {
  const host = pageEl.querySelector(`[${DETAIL_HOST_ATTR}]`)
  if (host) host.hidden = true
  setKinhnghimListVisible(pageEl, true)
}

export async function loadArticleBySlug(slug) {
  if (!slug) return null
  try {
    const { article } = await articlesApi.get(slug)
    return article || null
  } catch {
    return null
  }
}
