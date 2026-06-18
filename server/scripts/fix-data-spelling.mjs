/**
 * Sửa chính tả + khôi phục tiếng Việt UTF-8 trong DB (dữ liệu import sai charset).
 * Chạy: npm run fix:data-spelling
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

async function run(sql, params) {
  await conn.execute(sql, params)
}

const CATEGORIES = [
  [1, 'Tất cả'],
  [2, 'Trong ngày'],
  [3, 'Qua đêm'],
  [4, 'Trail Challenge'],
  [5, 'Camping'],
  [6, 'Giải chạy'],
]

for (const [id, name] of CATEGORIES) {
  await run('UPDATE trip_categories SET name = ? WHERE id = ?', [name, id])
  console.log('category', id, '→', name)
}

const TRIPS = [
  {
    id: 1,
    title: 'Thác Liêng Ài - Đồi Chè Tâm Châu',
    destination: 'Đồi Chè Tâm Châu',
    short_description: 'Cung đường Trekking đẹp',
    route_description:
      'Hành trình qua Thác Liêng Ài và đồi chè Tâm Châu với cảnh quan núi rừng Tây Nguyên.',
    preparation_notes: 'Mang giày trekking, áo mưa, nước và đồ dùng cá nhân gọn nhẹ.',
    important_notes: 'Theo dõi thời tiết vùng núi; giữ nhịp đi phù hợp sức khỏe.',
    itinerary_summary: '03h15 khởi hành tại Đinh Tiên Hoàng — Lịch trình dự kiến trong ngày',
    pickup_point: '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)',
    duration_label: '1 ngày',
  },
  {
    id: 2,
    title: 'Đồi Chè Tâm Châu',
    destination: 'Đồi Chè Tâm Châu',
    short_description: 'Cung đường Trekking đẹp',
    route_description: 'Khám phá đồi chè xanh và làng văn hóa Cồng chiêng Tâm Châu.',
    preparation_notes: 'Giày chống trượt, mũ, kem chống nắng.',
    important_notes: 'Không xả rác; tôn trọng cộng đồng địa phương.',
    itinerary_summary: 'Lịch trình 1 ngày — trải nghiệm chè và trekking nhẹ',
    pickup_point: '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)',
    duration_label: '1 ngày',
  },
  {
    id: 3,
    title: 'Hồ Ngọc Liêng Ài',
    destination: 'Hồ Ngọc Liêng Ài',
    short_description: 'Cung đường Trekking đẹp',
    route_description: 'Trekking quanh hồ và thác trong ngày, phù hợp người mới bắt đầu.',
    preparation_notes: 'Giày trekking, áo nhanh khô, túi nước 1,5–2 lít.',
    important_notes: 'Đường có đoạn đất đỏ trơn khi mưa.',
    itinerary_summary: 'Khởi hành sáng — về chiều cùng ngày',
    pickup_point: '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)',
    duration_label: 'Trong ngày',
  },
  {
    id: 4,
    title: 'Chuyến đi Langbiang',
    destination: 'Langbiang',
    short_description: 'Cung đường Trekking đẹp',
    route_description: 'Chinh phục đỉnh Langbiang, ngắm toàn cảnh thành phố Đà Lạt.',
    preparation_notes: 'Áo khoác ấm, găng tay, đèn pin (nếu qua đêm).',
    important_notes: 'Nhiệt độ đỉnh thấp; chuẩn bị tinh thần leo dốc.',
    itinerary_summary: '2 ngày 1 đêm — lịch trình trekking và nghỉ đêm',
    pickup_point: '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)',
    duration_label: '2 ngày 1 đêm',
  },
]

for (const t of TRIPS) {
  await run(
    `UPDATE trips SET
      title = ?, destination = ?, short_description = ?,
      route_description = ?, preparation_notes = ?, important_notes = ?,
      itinerary_summary = ?, pickup_point = ?, duration_label = ?
     WHERE id = ?`,
    [
      t.title,
      t.destination,
      t.short_description,
      t.route_description,
      t.preparation_notes,
      t.important_notes,
      t.itinerary_summary,
      t.pickup_point,
      t.duration_label,
      t.id,
    ],
  )
  console.log('trip', t.id, '→', t.title)
}

await run(
  `UPDATE articles SET
    title = ?,
    excerpt = ?,
    content_html = ?
   WHERE slug = 'di-leo-nui-can-chuan-bi-gi'`,
  [
    'Đi leo núi cần chuẩn bị gì?',
    'Sau những ngày làm việc căng thẳng, leo núi không chỉ giúp bạn thư giãn mà còn là cách để khám phá bản thân và tận hưởng vẻ đẹp thiên nhiên. Tuy nhiên, để hành trình được an toàn và trọn vẹn, bạn cần chuẩn bị chu đáo. Hãy cùng DCX tìm hiểu những vật dụng thiết yếu và các lưu ý quan trọng cho chuyến leo núi của bạn!',
    '<p>Cẩm nang leo núi — vật dụng thiết yếu và các lưu ý quan trọng khi trekking.</p>',
  ],
)
console.log('article → Đi leo núi cần chuẩn bị gì?')

await run(`UPDATE addon_services SET description = ? WHERE id = 1`, [
  'Mua và nhận trong chuyến đi',
])
await run(`UPDATE addon_services SET name = ? WHERE id = 2`, ['Áo khoác chống nước'])

const MONTH_LABELS = [
  [1, 'Tháng 4'],
  [2, 'Tháng 5'],
  [3, 'Tháng 6'],
  [4, 'Tháng 7'],
  [5, 'Tháng 5'],
  [6, 'Tháng 6'],
]
for (const [id, label] of MONTH_LABELS) {
  await run('UPDATE trip_schedules SET month_label = ? WHERE id = ?', [label, id])
}

const [trips] = await conn.query(
  'SELECT id, title, duration_label, short_description FROM trips ORDER BY id',
)
const [cats] = await conn.query('SELECT id, name FROM trip_categories ORDER BY id')
const [art] = await conn.query('SELECT title FROM articles LIMIT 1')

console.log('\n--- Kiểm tra sau sửa ---')
console.log('categories:', cats)
console.log('trips:', trips)
console.log('article:', art[0]?.title)

await conn.end()
process.exit(0)
