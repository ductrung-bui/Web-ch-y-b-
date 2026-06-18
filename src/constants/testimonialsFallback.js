import { resolveTestimonialAvatar } from '../utils/testimonialAvatars.js'

/** Dữ liệu mẫu khi API chưa có bảng testimonials */
export const TESTIMONIALS_FALLBACK = [
  {
    id: 1,
    author_name: 'Sơn Tùng MTP',
    trip_title: 'Thác Liêng Ài - Đồi Chè Tâm Châu',
    quote:
      'Chuyến đi được tổ chức rất chuyên nghiệp, hướng dẫn viên nhiệt tình. Cung đường trekking đẹp, đoàn đi an toàn và vui vẻ.',
    avatar_url: resolveTestimonialAvatar(0),
    rating: 5,
  },
  {
    id: 2,
    author_name: 'Bích Phương',
    trip_title: 'Fansipan Legend — Sapa',
    quote:
      'Trải nghiệm leo núi tuyệt vời, view đỉnh Fansipan đáng từng bước chân. Dịch vụ đón trả và lưu trú được chuẩn bị kỹ.',
    avatar_url: resolveTestimonialAvatar(1),
    rating: 5,
  },
  {
    id: 3,
    author_name: 'Quân A.P',
    trip_title: 'Camping Đồi Chè — Qua đêm',
    quote:
      'Đêm camping bên đồi chè rất chill, đồ ăn ngon và team hỗ trợ suốt hành trình. Sẽ đặt thêm chuyến cùng Thế Giới Chạy Bộ.',
    avatar_url: resolveTestimonialAvatar(2),
    rating: 5,
  },
]
