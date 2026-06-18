import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { articlesApi } from '../api/endpoints.js'
import { bindArticleCardClicks, fillArticleSlots } from '../utils/articleCard.js'
import {
  bindArticleDetailBack,
  getArticleSlugFromParams,
  hideArticleDetail,
  loadArticleBySlug,
  renderArticleDetail,
  setKinhnghimListVisible,
} from '../utils/articleDetail.js'
import {
  bindArticlePagination,
  ensureArticlesPaginationHost,
} from '../utils/articlePagination.js'

const PAGE_SIZE = 3

/**
 * Trang Kinh nghiệm — một lưới 3 bài/trang + phân trang + chi tiết (?bai=slug).
 */
export function TeleportKinhnghimArticles() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [detailArticle, setDetailArticle] = useState(null)
  const cleanupRef = useRef(() => {})

  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)
  const articleSlug = getArticleSlugFromParams(params)

  useEffect(() => {
    articlesApi
      .list()
      .then(({ articles: list }) => {
        const raw = Array.isArray(list) ? list : []
        const seen = new Set()
        const unique = raw.filter((a) => {
          const key = a?.slug || a?.id
          if (!key || seen.has(key)) return false
          seen.add(key)
          return true
        })
        setArticles(unique)
      })
      .catch(() => setArticles([]))
  }, [])

  useEffect(() => {
    if (!articleSlug) {
      setDetailArticle(null)
      return
    }
    let cancelled = false
    loadArticleBySlug(articleSlug).then((article) => {
      if (!cancelled) setDetailArticle(article)
    })
    return () => {
      cancelled = true
    }
  }, [articleSlug])

  useEffect(() => {
    cleanupRef.current()

    const pageEl = document.querySelector('.teleport-page--kinhnghim')
    if (!pageEl) return

    const listArea = pageEl.querySelector('[class*="cmnangleoni-elm"]')
    const listRoot = pageEl.querySelector('[class*="bivitkinhnghim-elm1"]')

    const hideExtraListBlocks = () => {
      pageEl
        .querySelectorAll(
          '[class*="bivitkinhnghim-elm2"], [class*="bivitkinhnghim-elm3"]',
        )
        .forEach((el) => {
          el.style.setProperty('display', 'none', 'important')
          el.setAttribute('aria-hidden', 'true')
        })
    }
    hideExtraListBlocks()

    if (listArea) listArea.classList.add('kinhnghim-articles-list')
    if (listRoot) listRoot.classList.add('kinhnghim-articles-list')

    const goToList = () => {
      const merged = new URLSearchParams(params)
      merged.delete('bai')
      merged.delete('slug')
      setParams(merged)
      hideArticleDetail(pageEl)
      pageEl.querySelector('[class*="text-elm10"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }

    if (articleSlug) {
      if (detailArticle) {
        const host = renderArticleDetail(pageEl, detailArticle)
        cleanupRef.current = bindArticleDetailBack(host, goToList)
      } else {
        setKinhnghimListVisible(pageEl, false)
        const host = pageEl.querySelector('[data-kinhnghim-detail-host]')
        if (host) {
          host.hidden = false
          const title = host.querySelector('.kinhnghim-article-detail__title')
          const body = host.querySelector('.kinhnghim-article-detail__body')
          if (title) title.textContent = 'Đang tải bài viết...'
          if (body) body.innerHTML = '<p>Vui lòng đợi trong giây lát.</p>'
          cleanupRef.current = bindArticleDetailBack(host, goToList)
        }
      }
      return
    }

    hideArticleDetail(pageEl)

    const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const slice = articles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    hideExtraListBlocks()
    if (listArea) fillArticleSlots(listArea, [])
    if (listRoot) {
      fillArticleSlots(listRoot, slice)
      bindArticleCardClicks(listRoot, navigate)
    }

    const paginationHost = ensureArticlesPaginationHost(pageEl, {
      insertAfter: listRoot,
    })
    const paginationSection =
      paginationHost?.querySelector('[class*="pagination-elm"]') || paginationHost
    const showPagination = articles.length > 0 && totalPages > 1

    if (paginationHost) {
      paginationHost.hidden = !showPagination
      paginationHost.style.display = showPagination ? 'flex' : 'none'
      paginationHost.style.visibility = showPagination ? 'visible' : 'hidden'
      paginationHost.classList.toggle('kinhnghim-pagination--visible', showPagination)
    }

    if (showPagination && paginationSection) {
      cleanupRef.current = bindArticlePagination(paginationSection, {
        currentPage: safePage,
        totalPages,
        onPageChange: (next) => {
          const merged = new URLSearchParams(params)
          merged.delete('bai')
          merged.delete('slug')
          if (next <= 1) merged.delete('page')
          else merged.set('page', String(next))
          setParams(merged)
          pageEl.querySelector('[class*="cmnangleoni-elm"]')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        },
      })
    }
  }, [articles, page, params, setParams, navigate, articleSlug, detailArticle])

  useEffect(() => () => cleanupRef.current(), [])

  return null
}
