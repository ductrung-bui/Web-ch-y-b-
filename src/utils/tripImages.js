/** Loại file quá nặng khỏi bundle Vite (không chỉ runtime) */
const assetModules = import.meta.glob(
  [
    '../assets/Ảnh chuyến đi/**/*.{webp,jpg,jpeg,JPG,JPEG,WEBP}',
    '!../assets/Ảnh chuyến đi/**/dinh-470-1778839223.jpg',
    '!../assets/Ảnh chuyến đi/**/TK-436 (1).webp',
    '!../assets/Ảnh chuyến đi/**/TK-464 (1).webp',
    '!../assets/Ảnh chuyến đi/**/TK-649 (1).webp',
    '!../assets/Ảnh chuyến đi/**/TK-649 (1) (1).webp',
    '!../assets/Ảnh chuyến đi/**/68.webp',
    '!../assets/Ảnh chuyến đi/**/75.webp',
    '!../assets/Ảnh chuyến đi/**/bidouptg03012026-111-1-1778832155.jpg',
    '!../assets/Ảnh chuyến đi/**/bidoup-camp-0452-2-1777885872-845.jpg',
    '!../assets/Ảnh chuyến đi/**/tamtham-876-1-1778647411-325.jpg',
    '!../assets/Ảnh chuyến đi/**/DSC00413 (1).webp',
    '!../assets/Ảnh chuyến đi/**/Chuachan-095 (1).webp',
    '!../assets/Ảnh chuyến đi/**/Chuachan-294 (1).webp',
    '!../assets/Ảnh chuyến đi/**/Chuachan-344 (1).webp',
  ],
  { eager: true, query: '?url', import: 'default' },
)

const CATEGORY_FOLDER = {
  same_day: 'Chuyến trong ngày',
  overnight: 'Chuyến qua đêm',
  trail: 'Trail Challenge',
  camping: 'Camping',
  race: 'Giải chạy',
}

const BLOCKED_ASSET = /dinh-470-1778839223|TK-436 \(1\)|TK-464 \(1\)|TK-649|\/68\.webp|\/75\.webp|Chuachan-095|Chuachan-294|Chuachan-344|bidouptg03012026-111|bidoup-camp-0452|tamtham-876-1-1778647411-325/i

function isUsableTripAsset(path) {
  return path && !BLOCKED_ASSET.test(path)
}

const imagesByCategory = Object.keys(CATEGORY_FOLDER).reduce((acc, code) => {
  const folder = CATEGORY_FOLDER[code]
  acc[code] = Object.entries(assetModules)
    .filter(([path]) => path.includes(folder) && isUsableTripAsset(path))
    .map(([, url]) => (typeof url === 'string' ? url : null))
    .filter(Boolean)
  return acc
}, {})

const fallbackPool = Object.entries(assetModules)
  .map(([path, url]) => (isUsableTripAsset(path) && typeof url === 'string' ? url : null))
  .filter(Boolean)

export function resolveTripImageUrl(trip, index = 0) {
  if (trip?.thumbnail_url) return trip.thumbnail_url

  const code = trip?.category_code || 'trail'
  const pool = imagesByCategory[code]?.length ? imagesByCategory[code] : fallbackPool
  if (!pool.length) return '/favicon.svg'
  return pool[index % pool.length]
}
