/**
 * Thêm/cập nhật bài viết trang chủ (3 bài mới nhất).
 * Chạy: npm run fix:home-articles
 */
import mysql from 'mysql2/promise'
import { config } from '../src/config.js'

const conn = await mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  charset: 'utf8mb4',
})

await conn.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci')

const articles = [
  [
    'di-leo-nui-can-chuan-bi-gi',
    'Đi leo núi cần chuẩn bị gì?',
    'Sau những ngày làm việc căng thẳng, leo núi không chỉ giúp bạn thư giãn mà còn là cách để khám phá bản thân và tận hưởng vẻ đẹp thiên nhiên. Tuy nhiên, để hành trình được an toàn và trọn vẹn, bạn cần chuẩn bị chu đáo. Hãy cùng Thế Giới Chạy Bộ tìm hiểu những vật dụng thiết yếu và các lưu ý quan trọng cho chuyến leo núi của bạn!',
    '2025-02-11',
  ],
  [
    'checklist-trekking-3-ngay-2-dem',
    'Checklist trekking 3 ngày 2 đêm',
    'Lên đường trekking nhiều ngày cần checklist rõ ràng: trang phục, đồ ăn, y tế, đèn pin và kế hoạch dự phòng thời tiết. Thế Giới Chạy Bộ gợi ý bộ danh sách gọn để bạn không bỏ sót món quan trọng.',
    '2025-01-18',
  ],
  [
    'chon-giay-leo-nui-phu-hop',
    'Chọn giày leo núi phù hợp',
    'Giày là trang bị quan trọng nhất khi leo núi: đế chống trượt, ôm gót vừa vặn và thử mang tải trước ngày đi. Cùng Thế Giới Chạy Bộ xem cách chọn size và loại giày theo địa hình.',
    '2024-12-05',
  ],
  [
    'an-uong-khi-trekking',
    'Ăn uống khi trekking',
    'Năng lượng ổn định giúp bạn giữ nhịp trên đường: ưu tiên đồ khô nhẹ, bổ sung điện giải và nước đủ suốt hành trình. Thế Giới Chạy Bộ gợi ý thực đơn gọn cho chuyến trong ngày và qua đêm.',
    '2024-11-20',
  ],
  [
    'xu-ly-thoi-tiet-xau-khi-leo-nui',
    'Xử lý thời tiết xấu khi leo núi',
    'Mưa, sương mù hay gió mạnh đều có thể gặp trên núi. Hãy theo dõi dự báo, mang áo mưa, túi chống nước và biết thời điểm nên dừng — an toàn luôn quan trọng hơn chinh phục đỉnh.',
    '2024-10-08',
  ],
  [
    'meo-chup-anh-tren-nui',
    'Mẹo chụp ảnh trên núi',
    'Ánh sáng buổi sáng và hoàng hôn trên đỉnh thường đẹp nhất. Mang pin dự phòng, lau ống kính và giữ máy ấm — bạn sẽ có bộ ảnh kỷ niệm xứng đáng cho chuyến đi.',
    '2024-09-15',
  ],
]

for (const [slug, title, excerpt, published_at] of articles) {
  await conn.execute(
    `INSERT INTO articles (slug, title, excerpt, content_html, author_name, published_at, status)
     VALUES (?, ?, ?, '<p></p>', 'Thế Giới Chạy Bộ', ?, 'published')
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       excerpt = VALUES(excerpt),
       author_name = VALUES(author_name),
       published_at = VALUES(published_at),
       status = 'published'`,
    [slug, title, excerpt, published_at],
  )
  console.log(`OK: ${slug}`)
}

await conn.end()
console.log('Done.')
