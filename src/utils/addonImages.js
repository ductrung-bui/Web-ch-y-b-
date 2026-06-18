const addonAssetModules = import.meta.glob(
  [
    '../assets/**/Balo-Trekking.jpeg',
    '../assets/**/Binh-giu-nhiet-1-lit.jpg',
    '../assets/**/Gậy-Trekking.jpeg',
  ],
  { eager: true, query: '?url', import: 'default' },
)

function addonAssetUrl(filename) {
  const needle = String(filename).toLowerCase()
  const hit = Object.entries(addonAssetModules).find(([path]) =>
    path.toLowerCase().endsWith(`/${needle}`),
  )
  return hit?.[1] || null
}

export const ADDON_MINUS_ICON = '/icons/addon-minus.svg'
export const ADDON_PLUS_ICON = '/icons/addon-plus.svg'

const ADDON_IMAGE_BY_NAME = [
  { match: /balo/i, url: addonAssetUrl('Balo-Trekking.jpeg') },
  { match: /bình|binh/i, url: addonAssetUrl('Binh-giu-nhiet-1-lit.jpg') },
  { match: /gậy|gay/i, url: addonAssetUrl('Gậy-Trekking.jpeg') },
]

/** Ảnh thẻ dịch vụ bổ sung — file trong src/assets/Dịch-vụ-bổ-sung */
export function resolveAddonImageUrl(addon) {
  if (addon?.image_url?.trim()) return addon.image_url.trim()

  const name = addon?.name || ''
  const row = ADDON_IMAGE_BY_NAME.find((r) => r.match.test(name))
  return row?.url || null
}

export function applyAddonQtyIcons(card) {
  if (!card) return
  const minusImg = card.querySelector('[class*="minus-elm"]')
  const plusImg = card.querySelector('[class*="plus-elm"]')
  if (minusImg) {
    minusImg.src = ADDON_MINUS_ICON
    minusImg.alt = 'Giảm số lượng'
  }
  if (plusImg) {
    plusImg.src = ADDON_PLUS_ICON
    plusImg.alt = 'Tăng số lượng'
  }
}
