-- Chạy nếu mật khẩu trong Workbench bị lưu plain text (không đăng nhập được)
-- Mật khẩu sau khi chạy: Password@123
-- Hash bcrypt cho Password@123

USE mountain_web;

UPDATE users SET password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email IN ('khachhang@example.com', 'admin@thegioichaybo.vn');
