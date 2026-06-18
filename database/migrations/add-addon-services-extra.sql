-- Thêm 2 dịch vụ bổ sung (chạy một lần nếu DB đã seed cũ chỉ có 2 dòng)
INSERT INTO addon_services (trip_id, name, description, price, stock_status, purchase_timing, is_active)
SELECT NULL, 'Gậy trekking', 'Hỗ trợ leo dốc, giảm mỏi đầu gối', 80000, 'in_stock', 'during_trip', 1
WHERE NOT EXISTS (SELECT 1 FROM addon_services WHERE name = 'Gậy trekking');

INSERT INTO addon_services (trip_id, name, description, price, stock_status, purchase_timing, is_active)
SELECT NULL, 'Bình nước 1L', 'Giữ nước trong suốt hành trình', 50000, 'in_stock', 'during_trip', 1
WHERE NOT EXISTS (SELECT 1 FROM addon_services WHERE name = 'Bình nước 1L');
