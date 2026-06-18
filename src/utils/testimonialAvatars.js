/**
 * Avatar lời khen — src/assets/Lời khen (Vite) + public/avatars/testimonials (API/DB)
 */
const assetModules = import.meta.glob('../assets/Lời khen/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** Thứ tự khớp 3 lời khen trong seed (1 → 3) */
const AVATAR_FILE_KEYS = ['son-tung', 'bich-phuong', 'quan-ap']

const PUBLIC_AVATAR_URLS = [
  '/avatars/testimonials/son-tung-3-8362.jpg',
  '/avatars/testimonials/bich-phuong.webp',
  '/avatars/testimonials/Quan-ap.png',
]

function resolveBundledUrl(key) {
  const lower = key.toLowerCase()
  const hit = Object.entries(assetModules).find(([path]) => path.toLowerCase().includes(lower))
  return hit?.[1] ?? null
}

/** URL từ Vite (dev/build) — ưu tiên khi có import */
export const TESTIMONIAL_AVATAR_URLS = AVATAR_FILE_KEYS.map(
  (key, i) => resolveBundledUrl(key) || PUBLIC_AVATAR_URLS[i],
)

export function resolveTestimonialAvatar(index = 0) {
  const urls = TESTIMONIAL_AVATAR_URLS
  if (!urls.length) return null
  return urls[((index % urls.length) + urls.length) % urls.length]
}

/** Tên hiển thị trong khối lời khen (theo id 1 → 3) */
export const TESTIMONIAL_AUTHOR_NAMES = {
  1: 'Sơn Tùng MTP',
  2: 'Bích Phương',
  3: 'Quân A.P',
}

function resolveAuthorName(item, index) {
  const id = Number(item?.id)
  if (TESTIMONIAL_AUTHOR_NAMES[id]) return TESTIMONIAL_AUTHOR_NAMES[id]
  return TESTIMONIAL_AUTHOR_NAMES[index + 1] ?? item?.author_name ?? ''
}

export function enrichTestimonialsWithAvatars(items) {
  if (!Array.isArray(items)) return []
  return items.map((item, index) => {
    const url = item?.avatar_url?.trim()
    const author_name = resolveAuthorName(item, index)
    const base = { ...item, author_name }
    if (url && url !== 'null' && !url.includes('favicon.svg')) {
      return base
    }
    return { ...base, avatar_url: resolveTestimonialAvatar(index) }
  })
}
