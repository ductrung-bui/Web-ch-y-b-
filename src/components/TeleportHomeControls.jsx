import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const FILTERS = [
  { label: 'Tất cả', code: 'all', activeClass: 'mnhnhtrangch-ttc-thq-button-elm11' },
  { label: 'Trong ngày', code: 'same_day', activeClass: 'mnhnhtrangch-ttc-thq-button-elm13' },
  { label: 'Qua đêm', code: 'overnight', activeClass: 'mnhnhtrangch-ttc-thq-button-elm15' },
  { label: 'Trail Challenge', code: 'trail', activeClass: 'mnhnhtrangch-ttc-thq-button-elm17' },
  { label: 'Camping', code: 'camping', activeClass: 'mnhnhtrangch-ttc-thq-button-elm19' },
  { label: 'Giải chạy', code: 'race', activeClass: 'mnhnhtrangch-ttc-thq-button-elm21' },
]

const SEARCH_ICON = '/icons/search.svg'

function applyFilterStyles(page, activeCode) {
  FILTERS.forEach(({ code, activeClass }) => {
    const btn = page.querySelector(`.${activeClass}`)
    if (!btn) return
    btn.classList.add('home-filter-pill')
    btn.classList.toggle('home-filter-pill--active', code === activeCode)
    btn.style.backgroundColor = ''
    btn.style.borderColor = ''
    const span = btn.querySelector('span')
    if (span) span.style.color = ''
  })
}

function setupSearch(page, params, setParams) {
  const searchHost = page.querySelector('[class*="search-elm1"]')
  if (!searchHost) return () => {}

  searchHost.classList.add('home-search-box')

  const placeholder =
    searchHost.dataset.placeholder || 'Tìm kiếm chuyến đi'
  searchHost.dataset.placeholder = placeholder

  searchHost.querySelector('span')?.remove()

  let input = searchHost.querySelector('.home-search-box__input')
  if (!input) {
    input = document.createElement('input')
    input.type = 'search'
    input.className = 'home-search-box__input'
    searchHost.prepend(input)
  }
  input.placeholder = placeholder
  input.value = params.get('q') || ''

  let icon = searchHost.querySelector('.home-search-box__icon, [class*="search-elm2"]')
  if (!icon || icon.tagName !== 'IMG') {
    icon?.remove()
    icon = document.createElement('img')
    icon.className = 'home-search-box__icon'
    icon.alt = 'Tìm kiếm'
    searchHost.appendChild(icon)
  }
  icon.src = SEARCH_ICON
  icon.classList.add('home-search-box__icon')

  const runSearch = () => {
    const next = new URLSearchParams(params)
    const value = input.value.trim()
    if (value) next.set('q', value)
    else next.delete('q')
    setParams(next)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') runSearch()
  }

  input.addEventListener('keydown', onKeyDown)
  icon.addEventListener('click', runSearch)

  return () => {
    input.removeEventListener('keydown', onKeyDown)
    icon.removeEventListener('click', runSearch)
  }
}

function hideEmptyFilterButtons(page) {
  page.querySelectorAll('[class*="frame128-elm"] > button').forEach((btn) => {
    if (!btn.querySelector('span')?.textContent?.trim()) {
      btn.style.display = 'none'
      btn.hidden = true
    }
  })
}

export function TeleportHomeControls() {
  const [params, setParams] = useSearchParams()
  const activeCategory = params.get('category') || 'all'

  useEffect(() => {
    const page = document.querySelector('.teleport-page--mnhnhtrangch')
    if (!page) return

    hideEmptyFilterButtons(page)
    applyFilterStyles(page, activeCategory)

    const cleanups = []

    FILTERS.forEach(({ code, activeClass }) => {
      const btn = page.querySelector(`.${activeClass}`)
      if (!btn) return
      const onClick = () => {
        const next = new URLSearchParams(params)
        if (code === 'all') next.delete('category')
        else next.set('category', code)
        setParams(next)
      }
      btn.addEventListener('click', onClick)
      cleanups.push(() => btn.removeEventListener('click', onClick))
    })

    cleanups.push(setupSearch(page, params, setParams))

    return () => cleanups.forEach((fn) => fn())
  }, [params, setParams, activeCategory])

  return null
}
