# Sơ đồ dữ liệu — Web tour leo núi

## Map trang HTML → bảng MySQL

| Trang (slug) | Route React | Use case chính | Bảng dữ liệu |
|--------------|-------------|----------------|--------------|
| index | `/` | xem giới thiệu | `content_pages`, `support_contacts` |
| dangnhap | `/dang-nhap` | đăng nhập | `users`, `user_sessions` |
| dangky | `/dang-ky` | đăng ký | `users` |
| dangxuat | `/dang-xuat` | đăng xuất | `user_sessions` |
| nhapemailkhoiphuc | `/nhap-email-khoi-phuc` | khôi phục MK | `password_reset_tokens` |
| khoiphucmatkhau | `/khoi-phuc-mat-khau` | khôi phục MK | `password_reset_tokens`, `users` |
| thaydoimatkhau | `/thay-doi-mat-khau` | đổi MK | `users` |
| mnhnhtrangch | `/trang-chu` | danh sách / tìm / lọc | `trips`, `trip_categories`, `trip_schedules` |
| mnhnhchititchuyni | `/chi-tiet-chuyen-di` | chi tiết chuyến | `trips` |
| manhinhchonthoigianchuyendi | `/chon-thoi-gian-chuyen-di` | chọn chuyến | `trip_schedules` |
| manhinhchonvitrighengoi | `/chon-vi-tri-ghe` | chọn ghế | `seats`, `booking_seats` |
| dichvubosung | `/dich-vu-bo-sung` | dịch vụ thêm | `addon_services`, `booking_addons` |
| manhinhdienthongtin | `/dien-thong-tin` | nhập hành khách | `passengers` |
| manhinhthanhtoan | `/thanh-toan` | thanh toán | `payments`, `bookings` |
| thongtinvedadat | `/ve-da-dat` | xem vé | `bookings` (paid/confirmed) |
| thongtinvedahuy | `/ve-da-huy` | vé hủy | `bookings` (cancelled), `refunds` |
| lichsuchuyendi | `/lich-su-chuyen-di` | lịch sử | `bookings`, `booking_status_logs` |
| lchtrongthng | `/lich-trong-thang` | lịch tháng | `trip_schedules` |
| kinhnghim | `/kinh-nghiem` | bài viết | `articles` |

## Luồng đặt vé (Booking.mdj)

```
users → bookings (draft) → booking_seats → booking_addons → passengers
     → payments (pending → success) → bookings (paid/confirmed)
Hủy: bookings (cancelled) → refunds
```

## Cài đặt

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
