/**
 * Ảnh trang Giới thiệu — import tĩnh (không dùng eager glob toàn bộ assets).
 * Tránh treo trình duyệt do file ~38MB và hàng trăm module ảnh.
 */
import heroUrl from '../assets/Ảnh chuyến đi/Chuyến trong ngày/Thác Liêng Ài - Đồi Chè Tâm Châu/IMG_6484 (1).webp?url'
import gallery1 from '../assets/Ảnh chuyến đi/Chuyến qua đêm/Hồ Dankia - Cây Thông cô đơn - Đồi 3 cây thông/Doi cay thong-025.webp?url'
import gallery2 from '../assets/Ảnh chuyến đi/Chuyến trong ngày/Núi Dinh - sơn thủy hữu tình/dinh3-1742894160.webp?url'
import gallery3 from '../assets/Ảnh chuyến đi/Chuyến qua đêm/Cụm hang động núi lửa ChưBluk/DSC02698.webp?url'
import gallery4 from '../assets/Ảnh chuyến đi/Chuyến trong ngày/Leo núi Tà Cú - tắm biển Kê Gà/DCXTC-006.webp?url'
import gallery5 from '../assets/Ảnh chuyến đi/Camping/Tà Năng Phan Dũng Camping/tnpdc (14).webp?url'
import gallery6 from '../assets/Ảnh chuyến đi/Camping/Bidoup - Tà Giang Camping/bidouptg03012026-067-1-1778832366-365.jpg?url'
import gallery7 from '../assets/Ảnh chuyến đi/Chuyến qua đêm/Thôn Quảng Thừa - Chèo Sup Hồ Tuyền Lâm/qthua-1-1775370049-839.jpg?url'
import gallery8 from '../assets/Ảnh chuyến đi/Chuyến trong ngày/Núi Dinh - sơn thủy hữu tình/MD-674.webp?url'
import gallery9 from '../assets/Ảnh chuyến đi/Chuyến trong ngày/Núi Tương Kỳ - ngọn núi giữa phố biển/NLNN-65.webp?url'

const GALLERY_URLS = [
  gallery1,
  gallery2,
  gallery3,
  gallery4,
  gallery5,
  gallery6,
  gallery7,
  gallery8,
  gallery9,
]

export function resolveIntroHeroUrl() {
  return heroUrl || '/logo-tgcb.png'
}

export function getIntroGalleryUrls(count = 9) {
  return GALLERY_URLS.slice(0, count)
}

export function resolveIntroGalleryUrl(index = 0) {
  return GALLERY_URLS[index] || '/logo-tgcb.png'
}
