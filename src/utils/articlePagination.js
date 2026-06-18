const CHEVRON_LEFT = '/icons/chevron-left.svg'
const CHEVRON_RIGHT = '/icons/chevron-right.svg'

const CHEVRON_SVG = {
  left: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
  right: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`,
}

export function setPaginationIcon(host, side) {
  if (!host) return
  let icon = host.querySelector('.articles-pagination__icon')
  if (!icon) {
    const img = host.querySelector('img')
    if (img) {
      img.src = side === 'left' ? CHEVRON_LEFT : CHEVRON_RIGHT
      img.classList.add('articles-pagination__icon')
      img.alt = side === 'left' ? 'Trang trước' : 'Trang sau'
      return
    }
    icon = document.createElement('span')
    icon.className = 'articles-pagination__icon'
    if (side === 'left') host.prepend(icon)
    else host.append(icon)
  }
  icon.innerHTML = CHEVRON_SVG[side]
}

export function renderPageList(listEl, totalPages, currentPage, onSelect) {
  if (!listEl) return () => {}
  listEl.innerHTML = ''
  listEl.classList.add('articles-pagination__list')

  const buttons = []
  for (let p = 1; p <= totalPages; p += 1) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'articles-pagination__page'
    btn.textContent = String(p)
    btn.classList.toggle('articles-pagination__page--active', p === currentPage)
    btn.setAttribute('aria-label', `Trang ${p}`)
    btn.setAttribute('aria-current', p === currentPage ? 'page' : 'false')
    const onClick = () => onSelect(p)
    btn.addEventListener('click', onClick)
    listEl.appendChild(btn)
    buttons.push({ btn, onClick })
  }

  return () => {
    buttons.forEach(({ btn, onClick }) => btn.removeEventListener('click', onClick))
  }
}

const PAGINATION_HOST_CLASS = 'articles-pagination-host'

/** Tìm hoặc tạo khối phân trang (Teleport export đôi khi thiếu) */
export function ensureArticlesPaginationHost(pageEl, { insertAfter } = {}) {
  if (!pageEl) return null

  let host = pageEl.querySelector(`[class*="${PAGINATION_HOST_CLASS}"]`)
  if (!host) {
    host = document.createElement('div')
    host.className = 'kinhnghim-thq-articles-pagination-host'
    host.setAttribute('data-kinhnghim-pagination', '1')
    host.innerHTML = `
      <div class="kinhnghim-thq-pagination-elm">
        <div class="kinhnghim-thq-pagination-previous-elm">
          <img alt="Trang trước" src="/icons/chevron-left.svg" class="kinhnghim-thq-arrowleft-elm articles-pagination__icon" />
          <span class="kinhnghim-thq-text-elm-pag-prev SingleLineBodyBase">Trang trước</span>
        </div>
        <div class="kinhnghim-thq-pagination-list-elm"></div>
        <div class="kinhnghim-thq-pagination-next-elm">
          <span class="kinhnghim-thq-text-elm-pag-next SingleLineBodyBase">Trang sau</span>
          <img alt="Trang sau" src="/icons/chevron-right.svg" class="kinhnghim-thq-arrowright-elm articles-pagination__icon" />
        </div>
      </div>
    `
    const anchor =
      insertAfter ||
      pageEl.querySelector('[class*="bivitkinhnghim-elm1"]') ||
      pageEl.querySelector('[class*="cmnangleoni-elm"]')
    if (anchor?.parentElement) {
      anchor.insertAdjacentElement('afterend', host)
    } else {
      pageEl.querySelector('[class*="frame120-elm"]')?.appendChild(host)
    }
  }

  return host.querySelector('[class*="pagination-elm"]') || host
}

/**
 * Gắn phân trang Trang trước / Trang sau + số trang.
 * @returns hàm cleanup
 */
export function bindArticlePagination(section, { currentPage, totalPages, onPageChange }) {
  const prevHost = section.querySelector('[class*="pagination-previous-elm"]')
  const nextHost = section.querySelector('[class*="pagination-next-elm"]')
  const listEl = section.querySelector('[class*="pagination-list-elm"]')

  setPaginationIcon(prevHost, 'left')
  setPaginationIcon(nextHost, 'right')
  prevHost?.classList.add('articles-pagination__btn')
  nextHost?.classList.add('articles-pagination__btn')

  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const onPrev = (e) => {
    e.preventDefault()
    if (safePage > 1) onPageChange(safePage - 1)
  }
  const onNext = (e) => {
    e.preventDefault()
    if (safePage < totalPages) onPageChange(safePage + 1)
  }

  prevHost?.addEventListener('click', onPrev)
  nextHost?.addEventListener('click', onNext)

  if (prevHost) {
    prevHost.style.opacity = safePage <= 1 ? '0.45' : '1'
    prevHost.style.pointerEvents = safePage <= 1 ? 'none' : 'auto'
    prevHost.setAttribute('aria-disabled', safePage <= 1 ? 'true' : 'false')
  }
  if (nextHost) {
    nextHost.style.opacity = safePage >= totalPages ? '0.45' : '1'
    nextHost.style.pointerEvents = safePage >= totalPages ? 'none' : 'auto'
    nextHost.setAttribute('aria-disabled', safePage >= totalPages ? 'true' : 'false')
  }

  const cleanupList = renderPageList(listEl, totalPages, safePage, onPageChange)

  return () => {
    prevHost?.removeEventListener('click', onPrev)
    nextHost?.removeEventListener('click', onNext)
    cleanupList()
  }
}
