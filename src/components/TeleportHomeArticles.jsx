import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { articlesApi } from '../api/endpoints.js'
import { bindArticleCardClicks, fillArticleSlots } from '../utils/articleCard.js'
import { bindArticlePagination } from '../utils/articlePagination.js'

const PAGE_SIZE = 3

/**
 * Bài viết mới nhất trên trang chủ — lưới đều + phân trang Trang trước/sau.
 */
export function TeleportHomeArticles() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const cleanupRef = useRef(() => {})

  const page = Math.max(1, parseInt(params.get('articlePage') || '1', 10) || 1)

  useEffect(() => {
    articlesApi
      .list()
      .then(({ articles: list }) => setArticles(Array.isArray(list) ? list : []))
      .catch(() => setArticles([]))
  }, [])

  useEffect(() => {
    cleanupRef.current()

    const section = document.querySelector(
      '.teleport-page--mnhnhtrangch [class*="frame117-elm"]',
    )
    if (!section) return

    section.classList.add('home-latest-articles')

    const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const slice = articles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    const grid = section.querySelector('[class*="frame115-elm"]')
    if (grid) fillArticleSlots(grid, slice)
    bindArticleCardClicks(section, navigate, { articleParam: 'bai' })

    cleanupRef.current = bindArticlePagination(section, {
      currentPage: safePage,
      totalPages,
      onPageChange: (next) => {
        const merged = new URLSearchParams(params)
        if (next <= 1) merged.delete('articlePage')
        else merged.set('articlePage', String(next))
        setParams(merged)
      },
    })
  }, [articles, page, params, setParams, navigate])

  useEffect(() => () => cleanupRef.current(), [])

  return null
}
