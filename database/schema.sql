-- =============================================================================
-- Thế Giới Chạy Bộ / Web tour leo núi
-- Schema MySQL 8.0+ — map từ use case (company/*.mdj) + màn hình HTML
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS mountain_web
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mountain_web;

-- -----------------------------------------------------------------------------
-- Vai trò & người dùng (đăng nhập, đăng ký, đăng xuất, hồ sơ)
-- Use case: đăng nhập tài khoản, đăng ký, đăng xuất, xem/cập nhật hồ sơ
-- Trang: dangnhap, dangky, dangxuat, thaydoimatkhau
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
  id          TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code        VARCHAR(30)  NOT NULL UNIQUE COMMENT 'user | admin',
  name        VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE users (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_id         TINYINT UNSIGNED NOT NULL DEFAULT 1,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(200) NOT NULL,
  phone           VARCHAR(20)  NULL,
  avatar_url      VARCHAR(500) NULL,
  status          ENUM('active','inactive','banned') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role_id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB COMMENT='Tài khoản khách hàng / admin';

CREATE TABLE user_sessions (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  token_hash   CHAR(64) NOT NULL COMMENT 'SHA-256 của session token',
  ip_address   VARCHAR(45) NULL,
  user_agent   VARCHAR(500) NULL,
  expires_at   DATETIME NOT NULL,
  revoked_at   DATETIME NULL COMMENT 'đăng xuất',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_token (token_hash),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  token_hash   CHAR(64) NOT NULL,
  expires_at   DATETIME NOT NULL,
  used_at      DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_prt_user (user_id),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='quên mật khẩu / khôi phục — nhapemailkhoiphuc, khoiphucmatkhau';

-- -----------------------------------------------------------------------------
-- Nội dung tĩnh (giới thiệu, liên hệ footer)
-- Trang: index
-- -----------------------------------------------------------------------------
CREATE TABLE content_pages (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug         VARCHAR(100) NOT NULL UNIQUE COMMENT 'gioi-thieu, su-menh, ...',
  title        VARCHAR(255) NOT NULL,
  body_html    MEDIUMTEXT NULL,
  meta_json    JSON NULL,
  published    TINYINT(1) NOT NULL DEFAULT 1,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE support_contacts (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  type         ENUM('address','hotline','email','social') NOT NULL,
  label        VARCHAR(100) NULL,
  value        VARCHAR(500) NOT NULL,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  is_active    TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Cẩm nang / kinh nghiệm
-- Trang: kinhnghim
-- -----------------------------------------------------------------------------
CREATE TABLE articles (
  id             BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug           VARCHAR(200) NOT NULL UNIQUE,
  title          VARCHAR(500) NOT NULL,
  excerpt        TEXT NULL,
  content_html   MEDIUMTEXT NULL,
  cover_image    VARCHAR(500) NULL,
  author_name    VARCHAR(200) NULL,
  published_at   DATE NULL,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Chuyến đi (tour management, danh sách, chi tiết, tìm kiếm, lọc)
-- Use case: xem danh sách, xem chi tiết, tìm kiếm, lọc, xem lịch trình
-- Trang: mnhnhtrangch, mnhnhchititchuyni, lchtrongthng
-- -----------------------------------------------------------------------------
CREATE TABLE trip_categories (
  id           SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code         VARCHAR(50) NOT NULL UNIQUE COMMENT 'all, same_day, overnight, trail, camping, race',
  name         VARCHAR(100) NOT NULL,
  sort_order   SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB COMMENT='Tất cả, Trong ngày, Qua đêm, Trail Challenge...';

CREATE TABLE trips (
  id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id         SMALLINT UNSIGNED NULL,
  slug                VARCHAR(200) NOT NULL UNIQUE,
  title               VARCHAR(500) NOT NULL,
  destination         VARCHAR(300) NULL COMMENT 'Điểm đến',
  short_description   VARCHAR(1000) NULL,
  route_description   TEXT NULL COMMENT 'Mô tả cung đường',
  preparation_notes   TEXT NULL COMMENT 'Cần chuẩn bị',
  important_notes     TEXT NULL COMMENT 'Lưu ý quan trọng',
  itinerary_summary   TEXT NULL COMMENT 'Lịch trình dự kiến',
  pickup_point        VARCHAR(500) NULL COMMENT 'Điểm xe đón',
  duration_label      VARCHAR(100) NULL COMMENT '2 ngày 1 đêm',
  base_price          DECIMAL(12,0) NOT NULL DEFAULT 0 COMMENT 'VNĐ / vé',
  max_participants    SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  current_participants SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'hiển thị 10/20',
  thumbnail_url       VARCHAR(500) NULL,
  status              ENUM('draft','open','full','closed','cancelled') NOT NULL DEFAULT 'open',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_trips_category (category_id),
  KEY idx_trips_status (status),
  FULLTEXT KEY ft_trips_search (title, destination, short_description),
  CONSTRAINT fk_trips_category FOREIGN KEY (category_id) REFERENCES trip_categories(id)
) ENGINE=InnoDB;

CREATE TABLE trip_schedules (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  trip_id         BIGINT UNSIGNED NOT NULL,
  departure_at    DATETIME NOT NULL COMMENT 'Lúc 03:15 Thứ Năm, 30/04/2026',
  return_at       DATETIME NULL,
  price           DECIMAL(12,0) NOT NULL COMMENT 'có thể khác base_price theo đợt',
  total_seats     SMALLINT UNSIGNED NOT NULL DEFAULT 40,
  booked_seats    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status          ENUM('open','full','closed','cancelled') NOT NULL DEFAULT 'open',
  month_label     VARCHAR(20) NULL COMMENT 'Tháng 4 — lchtrongthng',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_schedules_trip (trip_id),
  KEY idx_schedules_departure (departure_at),
  CONSTRAINT fk_schedules_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Chọn thời gian chuyến đi';

CREATE TABLE bus_layouts (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL,
  total_rows   TINYINT UNSIGNED NOT NULL,
  seats_per_row TINYINT UNSIGNED NOT NULL,
  door_side    ENUM('left','right') NOT NULL DEFAULT 'right'
) ENGINE=InnoDB;

CREATE TABLE seats (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  trip_schedule_id  BIGINT UNSIGNED NOT NULL,
  seat_number       VARCHAR(10) NOT NULL COMMENT '31, 32, A1...',
  seat_row          TINYINT UNSIGNED NULL,
  seat_col          TINYINT UNSIGNED NULL,
  is_door           TINYINT(1) NOT NULL DEFAULT 0,
  status            ENUM('available','held','booked') NOT NULL DEFAULT 'available',
  UNIQUE KEY uk_schedule_seat (trip_schedule_id, seat_number),
  CONSTRAINT fk_seats_schedule FOREIGN KEY (trip_schedule_id) REFERENCES trip_schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Chọn vị trí ghế — manhinhchonvitrighengoi';

-- -----------------------------------------------------------------------------
-- Dịch vụ bổ sung
-- Trang: dichvubosung
-- -----------------------------------------------------------------------------
CREATE TABLE addon_services (
  id              INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  trip_id         BIGINT UNSIGNED NULL COMMENT 'NULL = áp dụng mọi chuyến',
  name            VARCHAR(200) NOT NULL,
  description     VARCHAR(500) NULL,
  price           DECIMAL(12,0) NOT NULL,
  stock_status    ENUM('in_stock','out_of_stock') NOT NULL DEFAULT 'in_stock',
  purchase_timing ENUM('during_trip','before_trip') NOT NULL DEFAULT 'during_trip',
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  KEY idx_addon_trip (trip_id),
  CONSTRAINT fk_addon_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Đặt vé / booking flow
-- Use case: đặt vé, xác nhận đặt vé, nhập thông tin người đặt, chọn số lượng vé
-- Trang: manhinhdienthongtin → manhinhthanhtoan → thongtinvedadat
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_code      VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã vé hiển thị',
  user_id           BIGINT UNSIGNED NOT NULL,
  trip_schedule_id  BIGINT UNSIGNED NOT NULL,
  status            ENUM(
    'draft',           -- đang chọn ghế/dịch vụ
    'pending_payment',
    'paid',
    'confirmed',
    'completed',
    'cancelled',
    'refunded'
  ) NOT NULL DEFAULT 'draft',
  ticket_count      TINYINT UNSIGNED NOT NULL DEFAULT 1,
  ticket_amount     DECIMAL(12,0) NOT NULL DEFAULT 0,
  addon_amount      DECIMAL(12,0) NOT NULL DEFAULT 0,
  total_amount      DECIMAL(12,0) NOT NULL DEFAULT 0,
  selected_seats_label VARCHAR(200) NULL COMMENT '31, 32, 33, 34',
  notes             TEXT NULL,
  booked_at         DATETIME NULL,
  cancelled_at      DATETIME NULL,
  completed_at      DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_schedule (trip_schedule_id),
  KEY idx_bookings_status (status),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_schedule FOREIGN KEY (trip_schedule_id) REFERENCES trip_schedules(id)
) ENGINE=InnoDB;

CREATE TABLE booking_seats (
  booking_id  BIGINT UNSIGNED NOT NULL,
  seat_id     BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (booking_id, seat_id),
  CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_bs_seat FOREIGN KEY (seat_id) REFERENCES seats(id)
) ENGINE=InnoDB;

CREATE TABLE booking_addons (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id      BIGINT UNSIGNED NOT NULL,
  addon_service_id INT UNSIGNED NOT NULL,
  quantity        SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price      DECIMAL(12,0) NOT NULL,
  line_total      DECIMAL(12,0) NOT NULL,
  CONSTRAINT fk_ba_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_ba_addon FOREIGN KEY (addon_service_id) REFERENCES addon_services(id)
) ENGINE=InnoDB;

CREATE TABLE passengers (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id      BIGINT UNSIGNED NOT NULL,
  passenger_order TINYINT UNSIGNED NOT NULL COMMENT 'Hành khách 1, 2, 3',
  full_name       VARCHAR(200) NOT NULL,
  phone           VARCHAR(20) NULL,
  email           VARCHAR(255) NULL,
  id_number       VARCHAR(20) NULL COMMENT 'CCCD 12 số',
  date_of_birth   DATE NULL,
  KEY idx_passengers_booking (booking_id),
  CONSTRAINT fk_passengers_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Điền thông tin — manhinhdienthongtin';

-- -----------------------------------------------------------------------------
-- Thanh toán & hoàn tiền
-- Use case: thanh toán, xác nhận giao dịch (admin), hoàn tiền
-- Trang: manhinhthanhtoan
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id      BIGINT UNSIGNED NOT NULL,
  amount          DECIMAL(12,0) NOT NULL,
  method          ENUM('bank_transfer','momo','vnpay','cash','other') NOT NULL DEFAULT 'bank_transfer',
  status          ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(100) NULL,
  paid_at         DATETIME NULL,
  confirmed_by    BIGINT UNSIGNED NULL COMMENT 'admin xác nhận giao dịch',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_payments_booking (booking_id),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_payments_admin FOREIGN KEY (confirmed_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE refunds (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  payment_id   BIGINT UNSIGNED NOT NULL,
  booking_id   BIGINT UNSIGNED NOT NULL,
  amount       DECIMAL(12,0) NOT NULL,
  reason       VARCHAR(500) NULL,
  status       ENUM('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  processed_at DATETIME NULL,
  processed_by BIGINT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
  CONSTRAINT fk_refunds_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_refunds_admin FOREIGN KEY (processed_by) REFERENCES users(id)
) ENGINE=InnoDB COMMENT='Hủy vé + hoàn tiền';

CREATE TABLE booking_status_logs (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id   BIGINT UNSIGNED NOT NULL,
  from_status  VARCHAR(30) NULL,
  to_status    VARCHAR(30) NOT NULL,
  note         VARCHAR(500) NULL,
  created_by   BIGINT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bsl_booking (booking_id),
  CONSTRAINT fk_bsl_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Lịch sử chuyến đi / audit';

-- -----------------------------------------------------------------------------
-- Lời khen khách hàng (trang chủ)
-- Trang: mnhnhtrangch
-- -----------------------------------------------------------------------------
CREATE TABLE customer_testimonials (
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

-- -----------------------------------------------------------------------------
-- Ánh xạ use case (từ file .mdj) — tra cứu nghiệp vụ
-- -----------------------------------------------------------------------------
CREATE TABLE use_case_modules (
  id           SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code         VARCHAR(50) NOT NULL UNIQUE,
  name         VARCHAR(100) NOT NULL,
  source_file  VARCHAR(200) NULL COMMENT 'login.mdj, Booking.mdj...'
) ENGINE=InnoDB;

CREATE TABLE use_cases (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  module_id    SMALLINT UNSIGNED NOT NULL,
  code         VARCHAR(80) NOT NULL,
  name         VARCHAR(200) NOT NULL,
  actor        VARCHAR(50) NOT NULL DEFAULT 'user',
  description  TEXT NULL,
  UNIQUE KEY uk_uc_code (module_id, code),
  CONSTRAINT fk_uc_module FOREIGN KEY (module_id) REFERENCES use_case_modules(id)
) ENGINE=InnoDB;

CREATE TABLE page_use_case_map (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  page_slug    VARCHAR(80) NOT NULL COMMENT 'tên file html: dangnhap, mnhnhtrangch',
  use_case_id  INT UNSIGNED NOT NULL,
  route_path   VARCHAR(120) NULL COMMENT 'React route',
  UNIQUE KEY uk_page_uc (page_slug, use_case_id),
  CONSTRAINT fk_pum_uc FOREIGN KEY (use_case_id) REFERENCES use_cases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
