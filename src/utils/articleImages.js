/**
 * Ảnh bìa bài viết — cover_image DB hoặc assets (không dùng dịch vụ bổ sung)
 */
const assetModules = import.meta.glob(
  [
    '../assets/**/*.{webp,jpg,jpeg,WEBP,JPG,JPEG}',
    '!../assets/Ảnh chuyến đi/**',
    '!../assets/Dịch-vụ-bổ-sung/**',
  ],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

/** Ảnh chuyến đi dùng cho bìa bài (giới hạn vài file, tránh eager hàng trăm ảnh) */
const tripCoverModules = import.meta.glob(
  [
    '../assets/Ảnh chuyến đi/Chuyến trong ngày/**/*.{webp,jpg,jpeg}',
    '../assets/Ảnh chuyến đi/Camping/**/*.{webp,jpg,jpeg}',
    '../assets/Ảnh chuyến đi/Trail Challenge/**/*.{webp,jpg,jpeg}',
  ],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

function isExcludedAssetPath(path) {
  const p = String(path).toLowerCase()
  if (p.includes('dich-vu-bo-sung') || p.includes('dịch-vụ-bổ-sung')) return true
  if (p.endsWith('qr.jpeg') || p.includes('logo-tgcb')) return true
  return false
}

const assetEntries = [
  ...Object.entries(assetModules),
  ...Object.entries(tripCoverModules),
].filter(([path]) => !isExcludedAssetPath(path))

const coverPool = assetEntries.map(([, url]) => url).filter(Boolean)

const PREFERRED_FOR_SLUG = [
  { match: (slug) => slug.includes('di-leo-nui') || slug.includes('leo-nui'), pathKey: 'leo' },
  { match: (slug) => slug.includes('checklist') || slug.includes('trekking'), pathKey: 'trek' },
  { match: (slug) => slug.includes('giay') || slug.includes('chuan-bi'), pathKey: 'trek' },
  { match: (slug) => slug.includes('an-uong'), pathKey: 'camping' },
  { match: (slug) => slug.includes('thoi-tiet'), pathKey: 'nui' },
  { match: (slug) => slug.includes('chup-anh'), pathKey: 'dinh' },
]

function hashSlug(seed) {
  const s = String(seed || 'article')
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  }
  return hash
}

function findAssetByPathKey(key, seed = '') {
  const lower = key.toLowerCase()
  const hits = assetEntries.filter(([path]) => path.toLowerCase().includes(lower))
  if (!hits.length) return null
  const idx = hashSlug(`${seed}-${key}`) % hits.length
  return hits[idx][1]
}

/** Chọn ảnh ổn định theo slug — mỗi bài một ảnh khác nhau */
export function resolveArticleCoverUrl(article, index = 0) {
  const fromDb = article?.cover_image?.trim()
  if (fromDb && fromDb !== 'null' && !fromDb.includes('favicon.svg')) {
    if (!/dich-vu-bo-sung|dịch-vụ-bổ-sung/i.test(fromDb)) return fromDb
  }

  const slug = (article?.slug || '').toLowerCase()
  for (const rule of PREFERRED_FOR_SLUG) {
    if (rule.match(slug)) {
      const url = findAssetByPathKey(rule.pathKey, slug)
      if (url) return url
    }
  }

  if (coverPool.length) {
    const seed = slug || String(article?.id ?? index)
    return coverPool[hashSlug(seed) % coverPool.length]
  }

  return '/logo-tgcb.png'
}
