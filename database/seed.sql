-- =============================================================================
-- Dữ liệu mẫu — khớp nội dung HTML export TeleportHQ
-- Chạy sau schema.sql:  mysql -u root -p mountain_web < database/seed.sql
-- =============================================================================

USE mountain_web;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE page_use_case_map;
TRUNCATE TABLE use_cases;
TRUNCATE TABLE use_case_modules;
TRUNCATE TABLE booking_status_logs;
TRUNCATE TABLE refunds;
TRUNCATE TABLE payments;
TRUNCATE TABLE passengers;
TRUNCATE TABLE booking_addons;
TRUNCATE TABLE booking_seats;
TRUNCATE TABLE bookings;
TRUNCATE TABLE addon_services;
TRUNCATE TABLE seats;
TRUNCATE TABLE trip_schedules;
TRUNCATE TABLE trips;
TRUNCATE TABLE trip_categories;
TRUNCATE TABLE customer_testimonials;
TRUNCATE TABLE articles;
TRUNCATE TABLE support_contacts;
TRUNCATE TABLE content_pages;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE user_sessions;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE bus_layouts;
SET FOREIGN_KEY_CHECKS = 1;

-- Mật khẩu mẫu: Password@123 (bcrypt) — đổi khi triển khai thật
-- bcrypt Password@123: $2b$10$7r5HxkPrs4TemOIQuM8bROZludZ.tAPltA4FfUVEs9vzSQuB5gSne
INSERT INTO roles (id, code, name) VALUES
  (1, 'user',  'Khách hàng'),
  (2, 'admin', 'Quản trị viên');

INSERT INTO users (id, role_id, email, password_hash, full_name, phone, status, email_verified_at) VALUES
  (1, 2, 'admin@thegioichaybo.vn', '$2b$10$7r5HxkPrs4TemOIQuM8bROZludZ.tAPltA4FfUVEs9vzSQuB5gSne', 'Quản trị hệ thống', '0903663799', 'active', NOW()),
  (2, 1, 'khachhang@example.com', '$2b$10$7r5HxkPrs4TemOIQuM8bROZludZ.tAPltA4FfUVEs9vzSQuB5gSne', 'Nguyễn Văn A', '0912345678', 'active', NOW());

INSERT INTO support_contacts (type, label, value, sort_order) VALUES
  ('address', 'Chi nhánh 1', 'Số 199 Phan Đình Phùng, Phường Phú Nhuận, TP.HCM', 1),
  ('address', 'Chi nhánh 2', 'Số 68 Nguyễn Cơ Thạch, Phường An Khánh, Thủ Đức, TP.HCM', 2),
  ('hotline', 'Hotline', '0903 663 799', 3),
  ('email',   'CSKH', 'cskh@thegioichaybo.vn', 4);

INSERT INTO customer_testimonials (id, author_name, trip_title, quote, avatar_url, rating, sort_order) VALUES
  (1, 'Sơn Tùng MTP', 'Thác Liêng Ài - Đồi Chè Tâm Châu',
   'Chuyến đi được tổ chức rất chuyên nghiệp, hướng dẫn viên nhiệt tình. Cung đường trekking đẹp, đoàn đi an toàn và vui vẻ.',
   '/avatars/testimonials/son-tung-3-8362.jpg', 5, 1),
  (2, 'Bích Phương', 'Fansipan Legend — Sapa',
   'Trải nghiệm leo núi tuyệt vời, view đỉnh Fansipan đáng từng bước chân. Dịch vụ đón trả và lưu trú được chuẩn bị kỹ.',
   '/avatars/testimonials/bich-phuong.webp', 5, 2),
  (3, 'Quân A.P', 'Camping Đồi Chè — Qua đêm',
   'Đêm camping bên đồi chè rất chill, đồ ăn ngon và team hỗ trợ suốt hành trình. Sẽ đặt thêm chuyến cùng Thế Giới Chạy Bộ.',
   '/avatars/testimonials/Quan-ap.png', 5, 3);

INSERT INTO content_pages (slug, title, body_html) VALUES
  ('gioi-thieu', 'Về với thiên nhiên', '<p>Về với thiên nhiên — Về với chính mình</p>'),
  ('su-menh', 'Sứ mệnh',
   '<p>Thế Giới Chạy Bộ tạo ra những hành trình “Trở về Thiên Nhiên” theo kiểu gọn gàng và vừa sức — để bạn khỏe lên thật, đầu óc nhẹ đi thật, và có một nhóm người đồng điệu để đi cùng.</p>
    <p>Tụi mình không chạy theo “tour đông cho vui”. Thế Giới Chạy Bộ chọn cách làm kỹ: lịch trình rõ, nhịp đi hợp nhiều cấp độ, có team hỗ trợ, có checklist chuẩn bị — để bạn yên tâm tận hưởng thiên nhiên.</p>');

INSERT INTO trip_categories (id, code, name, sort_order) VALUES
  (1, 'all',       'Tất cả', 0),
  (2, 'same_day',  'Trong ngày', 1),
  (3, 'overnight', 'Qua đêm', 2),
  (4, 'trail',     'Trail Challenge', 3),
  (5, 'camping',   'Camping', 4),
  (6, 'race',      'Giải chạy', 5);

INSERT INTO trips (
  id, category_id, slug, title, destination,
  short_description, route_description, preparation_notes, important_notes,
  itinerary_summary, pickup_point, duration_label, base_price,
  max_participants, current_participants, status
) VALUES
  (1, 4, 'thac-lieng-ai-doi-che-tam-chau', 'Thác Liêng Ài - Đồi Chè Tâm Châu', 'Đồi Chè Tâm Châu',
   'Cung đường Trekking đẹp',
   'Hành trình qua Thác Liêng Ài và đồi chè Tâm Châu với cảnh quan núi rừng Tây Nguyên.',
   'Mang giày trekking, áo mưa, nước và đồ dùng cá nhân gọn nhẹ.',
   'Theo dõi thời tiết vùng núi; giữ nhịp đi phù hợp sức khỏe.',
   '03h15 khởi hành tại Đinh Tiên Hoàng — Lịch trình dự kiến trong ngày',
   '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)', '1 ngày', 700000, 20, 10, 'open'),
  (2, 3, 'doi-che-tam-chau', 'Đồi Chè Tâm Châu', 'Đồi Chè Tâm Châu',
   'Cung đường Trekking đẹp',
   'Khám phá đồi chè xanh và làng văn hóa Cồng chiêng Tâm Châu.',
   'Giày chống trượt, mũ, kem chống nắng.',
   'Không xả rác; tôn trọng cộng đồng địa phương.',
   'Lịch trình 1 ngày — trải nghiệm chè và trekking nhẹ',
   '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)', '1 ngày', 700000, 20, 15, 'open'),
  (3, 2, 'ho-ngoc-lieng-ai', 'Hồ Ngọc Liêng Ài', 'Hồ Ngọc Liêng Ài',
   'Cung đường Trekking đẹp',
   'Trekking quanh hồ và thác trong ngày, phù hợp người mới bắt đầu.',
   'Giày trekking, áo nhanh khô, túi nước 1,5–2 lít.',
   'Đường có đoạn đất đỏ trơn khi mưa.',
   'Khởi hành sáng — về chiều cùng ngày',
   '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)', 'Trong ngày', 650000, 20, 8, 'open'),
  (4, 3, 'langbiang', 'Chuyến đi Langbiang', 'Langbiang',
   'Cung đường Trekking đẹp',
   'Chinh phục đỉnh Langbiang, ngắm toàn cảnh thành phố Đà Lạt.',
   'Áo khoác ấm, găng tay, đèn pin (nếu qua đêm).',
   'Nhiệt độ đỉnh thấp; chuẩn bị tinh thần leo dốc.',
   '2 ngày 1 đêm — lịch trình trekking và nghỉ đêm',
   '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)', '2 ngày 1 đêm', 1200000, 30, 20, 'open'),
  (5, 5, 'ta-nang-phan-dung-camping', 'Tà Nắng Phan Dũng Camping', 'Tà Nắng Phan Dũng',
   'Camping',
   'Trải nghiệm cắm trại giữa rừng thông và biển cát trắng Phan Dũng.',
   'Lều, túi ngủ, đồ nấu ăn nhẹ; mang áo ấm buổi tối.',
   'Không đốt lửa ngoài khu vực cho phép; giữ vệ sinh khu cắm trại.',
   '2 ngày 1 đêm — camping và khám phá bãi biển',
   '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)', '2 ngày 1 đêm', 1350000, 25, 12, 'open'),
  (6, 5, 'bidoup-camping', 'Bidoup - Tà Giang Camping', 'Bidoup',
   'Camping',
   'Cắm trại trên đồi thông Bidoup, ngắm sương sớm và bình minh.',
   'Giày trekking, áo khoác, đèn pin; mang túi rác cá nhân.',
   'Theo dõi thời tiết; không leo một mình khi sương dày.',
   '2 ngày 1 đêm — camping rừng thông',
   '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)', '2 ngày 1 đêm', 1280000, 20, 8, 'open'),
  (7, 6, 'giai-chay-da-lat-trail', 'Giải chạy Trail Đà Lạt', 'Đà Lạt',
   'Giải chạy',
   'Giải chạy trail 21km qua đồi thông và suối nhỏ vùng Langbiang.',
   'Giày trail, bình nước, đồ ăn nhẹ năng lượng; khởi động kỹ.',
   'Tuân thủ cự ly và marker; có đội y tế tại trạm tiếp nước.',
   '1 ngày — cự ly 21km',
   '02 Đinh Tiên Hoàng, Q.1 (Cổng SVĐ Hoa Lư)', 'Trong ngày', 850000, 200, 45, 'open');

INSERT INTO trip_schedules (id, trip_id, departure_at, return_at, price, total_seats, booked_seats, status, month_label) VALUES
  (1, 1, '2026-04-30 03:15:00', '2026-04-30 18:00:00', 710000, 40, 4, 'open', 'Tháng 4'),
  (2, 1, '2026-05-15 03:15:00', '2026-05-16 18:00:00', 710000, 40, 0, 'open', 'Tháng 5'),
  (3, 1, '2026-06-10 03:15:00', '2026-06-10 18:00:00', 700000, 40, 0, 'open', 'Tháng 6'),
  (4, 4, '2026-07-13 06:00:00', '2026-07-14 20:00:00', 1200000, 40, 4, 'open', 'Tháng 7'),
  (5, 2, '2026-05-20 06:00:00', '2026-05-20 18:00:00', 700000, 20, 2, 'open', 'Tháng 5'),
  (6, 2, '2026-06-05 06:00:00', '2026-06-05 18:00:00', 700000, 20, 2, 'open', 'Tháng 6'),
  (7, 5, '2026-08-10 06:00:00', '2026-08-11 18:00:00', 1350000, 25, 5, 'open', 'Tháng 8'),
  (8, 6, '2026-09-05 06:00:00', '2026-09-06 17:00:00', 1280000, 20, 3, 'open', 'Tháng 9'),
  (9, 7, '2026-10-12 05:00:00', '2026-10-12 14:00:00', 850000, 200, 30, 'open', 'Tháng 10');

INSERT INTO bus_layouts (id, name, total_rows, seats_per_row) VALUES (1, 'Xe 40 chỗ', 10, 4);

-- Ghế mẫu (UI: ghế 31–34)
INSERT INTO seats (trip_schedule_id, seat_number, seat_row, seat_col, status) VALUES
  (1, '31', 8, 3, 'available'),
  (1, '32', 8, 4, 'available'),
  (4, '31', 8, 3, 'booked'),
  (4, '32', 8, 4, 'booked'),
  (4, '33', 9, 3, 'booked'),
  (4, '34', 9, 4, 'booked');

INSERT INTO addon_services (id, trip_id, name, description, price, stock_status, purchase_timing) VALUES
  (1, NULL, 'Balo Trekking', 'Mua và nhận trong chuyến đi', 100000, 'in_stock', 'during_trip'),
  (2, 1, 'Áo khoác chống nước', 'Giữ ấm khi leo núi buổi tối', 150000, 'in_stock', 'during_trip'),
  (3, NULL, 'Gậy trekking', 'Hỗ trợ leo dốc, giảm mỏi đầu gối', 80000, 'in_stock', 'during_trip'),
  (4, NULL, 'Bình nước 1L', 'Giữ nước trong suốt hành trình', 50000, 'in_stock', 'during_trip');

INSERT INTO articles (slug, title, excerpt, content_html, author_name, published_at, status) VALUES
  ('di-leo-nui-can-chuan-bi-gi', 'Đi leo núi cần chuẩn bị gì?',
   'Sau những ngày làm việc căng thẳng, leo núi không chỉ giúp bạn thư giãn mà còn là cách để khám phá bản thân và tận hưởng vẻ đẹp thiên nhiên. Tuy nhiên, để hành trình được an toàn và trọn vẹn, bạn cần chuẩn bị chu đáo. Hãy cùng Thế Giới Chạy Bộ tìm hiểu những vật dụng thiết yếu và các lưu ý quan trọng cho chuyến leo núi của bạn!',
   '<p>Cẩm nang leo núi — vật dụng thiết yếu và các lưu ý quan trọng khi trekking.</p>',
   'Thế Giới Chạy Bộ', '2025-02-11', 'published'),
  ('checklist-trekking-3-ngay-2-dem', 'Checklist trekking 3 ngày 2 đêm',
   'Lên đường trekking nhiều ngày cần checklist rõ ràng: trang phục, đồ ăn, y tế, đèn pin và kế hoạch dự phòng thời tiết. Thế Giới Chạy Bộ gợi ý bộ danh sách gọn để bạn không bỏ sót món quan trọng.',
   '<p>Checklist đầy đủ cho hành trình trekking 3 ngày 2 đêm.</p>',
   'Thế Giới Chạy Bộ', '2025-01-18', 'published'),
  ('chon-giay-leo-nui-phu-hop', 'Chọn giày leo núi phù hợp',
   'Giày là trang bị quan trọng nhất khi leo núi: đế chống trượt, ôm gót vừa vặn và thử mang tải trước ngày đi. Cùng Thế Giới Chạy Bộ xem cách chọn size và loại giày theo địa hình.',
   '<p>Hướng dẫn chọn giày trekking theo địa hình và thời gian đi.</p>',
   'Thế Giới Chạy Bộ', '2024-12-05', 'published'),
  ('an-uong-khi-trekking', 'Ăn uống khi trekking',
   'Năng lượng ổn định giúp bạn giữ nhịp trên đường: ưu tiên đồ khô nhẹ, bổ sung điện giải và nước đủ suốt hành trình. Thế Giới Chạy Bộ gợi ý thực đơn gọn cho chuyến trong ngày và qua đêm.',
   '<p>Gợi ý thực đơn và cách bổ sung năng lượng khi trekking.</p>',
   'Thế Giới Chạy Bộ', '2024-11-20', 'published'),
  ('xu-ly-thoi-tiet-xau-khi-leo-nui', 'Xử lý thời tiết xấu khi leo núi',
   'Mưa, sương mù hay gió mạnh đều có thể gặp trên núi. Hãy theo dõi dự báo, mang áo mưa, túi chống nước và biết thời điểm nên dừng — an toàn luôn quan trọng hơn chinh phục đỉnh.',
   '<p>Kỹ năng ứng phó thời tiết khi leo núi và trekking.</p>',
   'Thế Giới Chạy Bộ', '2024-10-08', 'published'),
  ('meo-chup-anh-tren-nui', 'Mẹo chụp ảnh trên núi',
   'Ánh sáng buổi sáng và hoàng hôn trên đỉnh thường đẹp nhất. Mang pin dự phòng, lau ống kính và giữ máy ấm — bạn sẽ có bộ ảnh kỷ niệm xứng đáng cho chuyến đi.',
   '<p>Mẹo chụp ảnh phong cảnh và portrait khi trekking.</p>',
   'Thế Giới Chạy Bộ', '2024-09-15', 'published');

-- Booking đã thanh toán (thongtinvedadat — Langbiang)
INSERT INTO bookings (
  id, booking_code, user_id, trip_schedule_id, status,
  ticket_count, ticket_amount, addon_amount, total_amount,
  selected_seats_label, booked_at
) VALUES
  (1, 'BK20260713001', 2, 4, 'paid', 4, 4800000, 100000, 4900000, '31, 32, 33, 34', '2026-06-01 10:00:00'),
  (2, 'BK20260211001', 2, 1, 'completed', 2, 1420000, 0, 1420000, NULL, '2026-01-15 09:00:00');

INSERT INTO booking_seats (booking_id, seat_id)
SELECT 1, id FROM seats WHERE trip_schedule_id = 4 AND seat_number IN ('31','32','33','34');

INSERT INTO booking_addons (booking_id, addon_service_id, quantity, unit_price, line_total) VALUES
  (1, 1, 1, 100000, 100000);

INSERT INTO passengers (booking_id, passenger_order, full_name, phone, email, id_number, date_of_birth) VALUES
  (1, 1, 'Nguyễn Văn A', '0912345678', 'khachhang@example.com', '079123456789', '1995-05-20'),
  (1, 2, 'Trần Thị B', '0987654321', NULL, '079987654321', '1998-08-12');

INSERT INTO payments (booking_id, amount, method, status, transaction_ref, paid_at, confirmed_by) VALUES
  (1, 4900000, 'bank_transfer', 'success', 'TXN-20260601-001', '2026-06-01 10:30:00', 1);

-- Booking đã hủy (thongtinvedahuy)
INSERT INTO bookings (
  id, booking_code, user_id, trip_schedule_id, status,
  ticket_count, ticket_amount, addon_amount, total_amount,
  selected_seats_label, cancelled_at
) VALUES
  (3, 'BK20260713002', 2, 4, 'cancelled', 4, 4800000, 0, 4800000, '31, 32, 33, 34', '2026-06-10 14:00:00'),
  (4, 'BK20260520001', 2, 5, 'completed', 2, 1400000, 0, 1400000, NULL, '2026-04-20 08:00:00'),
  (5, 'BK20260605001', 2, 6, 'completed', 2, 1400000, 0, 1400000, NULL, '2026-05-05 08:00:00'),
  (6, 'BK20260612001', 2, 5, 'completed', 2, 1400000, 0, 1400000, NULL, '2026-05-12 08:00:00');

INSERT INTO payments (booking_id, amount, method, status, paid_at) VALUES
  (3, 4800000, 'momo', 'refunded', '2026-06-05 11:00:00');

INSERT INTO refunds (payment_id, booking_id, amount, reason, status, processed_at, processed_by) VALUES
  (2, 3, 4800000, 'Khách hàng hủy vé trước 7 ngày', 'completed', '2026-06-11 09:00:00', 1);

INSERT INTO booking_status_logs (booking_id, from_status, to_status, note) VALUES
  (1, 'pending_payment', 'paid', 'Khách chuyển khoản'),
  (1, 'paid', 'confirmed', 'Admin xác nhận giao dịch'),
  (3, 'paid', 'cancelled', 'Khách hàng yêu cầu hủy'),
  (3, 'cancelled', 'refunded', 'Hoàn tiền Momo');

-- Use case modules & mapping
INSERT INTO use_case_modules (id, code, name, source_file) VALUES
  (1, 'auth',        'Authentication', 'login.mdj'),
  (2, 'booking',     'Booking',        'Booking.mdj'),
  (3, 'payment',     'Payment',        'payment.mdj'),
  (4, 'tour',        'Tour Management','tour management.mdj'),
  (5, 'history',     'History',        'History.mdj'),
  (6, 'profile',     'Profile',        'Profile.mdj'),
  (7, 'overview',    'Web tour leo núi','web tour leo núi.mdj');

INSERT INTO use_cases (module_id, code, name, actor) VALUES
  (1, 'login',           'đăng nhập tài khoản', 'user'),
  (1, 'register',        'đăng ký tài khoản', 'user'),
  (1, 'logout',          'đăng xuất', 'user'),
  (1, 'forgot_password', 'khôi phục mật khẩu', 'user'),
  (1, 'verify_email',    'xác thực bằng email', 'user'),
  (2, 'book_ticket',     'đặt vé', 'user'),
  (2, 'select_trip',     'chọn chuyến đi', 'user'),
  (2, 'select_seats',    'chọn số lượng vé / ghế', 'user'),
  (2, 'enter_passenger', 'nhập thông tin người đặt', 'user'),
  (2, 'confirm_booking', 'xác nhận đặt vé', 'user'),
  (2, 'cancel_ticket',   'hủy vé', 'user'),
  (2, 'view_ticket',     'xem vé', 'user'),
  (2, 'view_trip_info',  'xem thông tin chuyến đi', 'user'),
  (3, 'pay',             'thanh toán', 'user'),
  (3, 'confirm_txn',     'xác nhận giao dịch', 'admin'),
  (3, 'refund',          'hoàn tiền', 'admin'),
  (4, 'list_trips',      'xem danh sách chuyến đi', 'user'),
  (4, 'trip_detail',     'xem chi tiết chuyến đi', 'user'),
  (4, 'search_trip',     'tìm kiếm chuyến đi', 'user'),
  (4, 'filter_trip',     'lọc chuyến đi', 'user'),
  (4, 'view_schedule',   'xem lịch trình', 'user'),
  (5, 'history_list',    'xem lịch sử chuyến đi', 'user'),
  (5, 'history_detail',  'xem chi tiết lịch sử', 'user'),
  (5, 'cancel_history',  'xem lịch sử hủy vé', 'user'),
  (6, 'view_profile',    'xem hồ sơ cá nhân', 'user'),
  (6, 'update_profile',  'cập nhật thông tin hồ sơ', 'user'),
  (6, 'change_password', 'thay đổi mật khẩu', 'user'),
  (7, 'intro',           'xem giới thiệu', 'user');

INSERT INTO page_use_case_map (page_slug, use_case_id, route_path)
SELECT 'index', id, '/' FROM use_cases WHERE code = 'intro'
UNION ALL SELECT 'dangnhap', id, '/dang-nhap' FROM use_cases WHERE code = 'login'
UNION ALL SELECT 'dangky', id, '/dang-ky' FROM use_cases WHERE code = 'register'
UNION ALL SELECT 'dangxuat', id, '/dang-xuat' FROM use_cases WHERE code = 'logout'
UNION ALL SELECT 'nhapemailkhoiphuc', id, '/nhap-email-khoi-phuc' FROM use_cases WHERE code = 'forgot_password'
UNION ALL SELECT 'khoiphucmatkhau', id, '/khoi-phuc-mat-khau' FROM use_cases WHERE code = 'forgot_password'
UNION ALL SELECT 'thaydoimatkhau', id, '/thay-doi-mat-khau' FROM use_cases WHERE code = 'change_password'
UNION ALL SELECT 'mnhnhtrangch', id, '/trang-chu' FROM use_cases WHERE code IN ('list_trips','search_trip','filter_trip')
UNION ALL SELECT 'mnhnhchititchuyni', id, '/chi-tiet-chuyen-di' FROM use_cases WHERE code = 'trip_detail'
UNION ALL SELECT 'manhinhchonthoigianchuyendi', id, '/chon-thoi-gian-chuyen-di' FROM use_cases WHERE code = 'select_trip'
UNION ALL SELECT 'manhinhchonvitrighengoi', id, '/chon-vi-tri-ghe' FROM use_cases WHERE code = 'select_seats'
UNION ALL SELECT 'dichvubosung', id, '/dich-vu-bo-sung' FROM use_cases WHERE code = 'book_ticket'
UNION ALL SELECT 'manhinhdienthongtin', id, '/dien-thong-tin' FROM use_cases WHERE code = 'enter_passenger'
UNION ALL SELECT 'manhinhthanhtoan', id, '/thanh-toan' FROM use_cases WHERE code = 'pay'
UNION ALL SELECT 'thongtinvedadat', id, '/ve-da-dat' FROM use_cases WHERE code = 'view_ticket'
UNION ALL SELECT 'thongtinvedahuy', id, '/ve-da-huy' FROM use_cases WHERE code = 'cancel_history'
UNION ALL SELECT 'lichsuchuyendi', id, '/lich-su-chuyen-di' FROM use_cases WHERE code = 'history_list'
UNION ALL SELECT 'lchtrongthng', id, '/lich-trong-thang' FROM use_cases WHERE code = 'view_schedule'
UNION ALL SELECT 'kinhnghim', id, NULL FROM use_cases WHERE code = 'intro';
