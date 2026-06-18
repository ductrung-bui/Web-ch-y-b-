-- Thêm bảng lời khen (chạy một lần nếu DB đã có từ schema cũ)
-- mysql -u root -p mountain_web < database/migrations/add-customer-testimonials.sql

USE mountain_web;

CREATE TABLE IF NOT EXISTS customer_testimonials (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  author_name  VARCHAR(200) NOT NULL,
  trip_title   VARCHAR(500) NULL,
  quote        TEXT NOT NULL,
  avatar_url   VARCHAR(500) NULL,
  rating       TINYINT UNSIGNED NOT NULL DEFAULT 5,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Lời khen từ khách hàng — carousel trang chủ';

INSERT INTO customer_testimonials (id, author_name, trip_title, quote, avatar_url, rating, sort_order) VALUES
  (1, 'Sơn Tùng MTP', 'Thác Liêng Ài - Đồi Chè Tâm Châu',
   'Chuyến đi được tổ chức rất chuyên nghiệp, hướng dẫn viên nhiệt tình. Cung đường trekking đẹp, đoàn đi an toàn và vui vẻ.',
   '/avatars/testimonials/son-tung-3-8362.jpg', 5, 1),
  (2, 'Bích Phương', 'Fansipan Legend — Sapa',
   'Trải nghiệm leo núi tuyệt vời, view đỉnh Fansipan đáng từng bước chân. Dịch vụ đón trả và lưu trú được chuẩn bị kỹ.',
   '/avatars/testimonials/bich-phuong.webp', 5, 2),
  (3, 'Quân A.P', 'Camping Đồi Chè — Qua đêm',
   'Đêm camping bên đồi chè rất chill, đồ ăn ngon và team hỗ trợ suốt hành trình. Sẽ đặt thêm chuyến cùng Thế Giới Chạy Bộ.',
   '/avatars/testimonials/Quan-ap.png', 5, 3)
ON DUPLICATE KEY UPDATE
  author_name = VALUES(author_name),
  trip_title = VALUES(trip_title),
  quote = VALUES(quote),
  avatar_url = VALUES(avatar_url),
  rating = VALUES(rating),
  sort_order = VALUES(sort_order);
