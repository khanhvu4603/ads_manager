# idea.md

## 1. Mô tả dự án
Hệ thống Digital Signage đơn giản để phát 3 video quảng cáo (1–2 phút) lặp lại liên tục trên nhiều PC đặt ở các địa điểm khác nhau. Khi muốn thay đổi nội dung, chỉ cần cập nhật video mới từ dashboard.

## 2. Thành phần hệ thống
### 2.1. Client (PC + Màn hình)
- Mỗi PC chạy một website toàn màn hình.
- Website có chức năng:
  - Tải danh sách video từ server.
  - Cache video về máy để chạy offline.
  - Phát video theo playlist lặp vô hạn.
  - Nhận cập nhật khi server thay đổi playlist.

### 2.2. Server (Backend)
- Cung cấp API cho client lấy playlist.
- Cung cấp dashboard để quản lý nội dung.
- Lưu trữ playlist và thông tin thiết bị.
- Có WebSocket để gửi tín hiệu cập nhật realtime (không bắt buộc).

### 2.3. Dashboard (Frontend)
- Upload video.
- Chọn video tạo playlist.
- Gán playlist cho từng thiết bị.
- Theo dõi trạng thái client.

### 2.4. Lưu trữ nội dung
- Lưu video trên cloud storage: Cloudflare R2 (ưu tiên), AWS S3, Backblaze B2.
- Sử dụng CDN để phát nhanh.
- Server chỉ trả về JSON playlist, không chứa file video.

## 3. Hoạt động offline
- Website dạng PWA, dùng Service Worker để cache video.
- Khi playlist version thay đổi → client tải video mới.
- Khi mạng mất: vẫn chạy video trong cache.

## 4. Playlist mẫu (JSON)
```
{
  "version": 5,
  "videos": [
    "https://cdn.example.com/ad1.mp4",
    "https://cdn.example.com/ad2.mp4",
    "https://cdn.example.com/ad3.mp4"
  ]
}
```

## 5. Quy trình hoạt động
1. Quản trị viên upload video → Dashboard.
2. Backend lưu metadata playlist + update version.
3. Client tải playlist từ API.
4. Client so sánh version → nếu mới thì tải lại video.
5. Client cache video và chạy lặp.
6. Khi server cập nhật: gửi tín hiệu qua WebSocket hoặc client tự kiểm tra định kỳ.

## 6. Thiết bị đề xuất
- Mini PC giá rẻ (RAM 4–8GB, SSD 120GB).
- Màn hình LCD thường.
- Chrome ở chế độ fullscreen + auto start.

## 7. Ưu điểm
- Nhẹ, đơn giản, chi phí thấp.
- Hoạt động offline tốt.
- Dễ mở rộng.
- Control từ xa.

---

# Prompt triển khai toàn bộ dự án
Dùng prompt sau để AI tạo ra toàn bộ hệ thống Digital Signage từ A → Z:

"""
Bạn là kiến trúc sư hệ thống và kỹ sư phần mềm cấp cao. Hãy thiết kế và xây dựng trọn vẹn một hệ thống Digital Signage với yêu cầu sau:

## 1. Mục tiêu hệ thống
- Hệ thống có nhiều PC đặt tại nhiều địa điểm, mỗi PC phát 3 video quảng cáo dài 1–2 phút lặp lại.
- Khi admin thay đổi video, tất cả PC phải tự cập nhật.
- PC phải chạy được OFFLINE: tự cache video và phát ngay cả khi mất mạng.

## 2. Yêu cầu phần Client (Website chạy fullscreen)
- Tạo website dạng PWA.
- Sử dụng Service Worker để cache video, HTML, JS.
- Lưu video vào IndexedDB hoặc Cache API.
- Phát video theo playlist lặp vô hạn.
- Tự kiểm tra version playlist từ API.
- Khi version thay đổi: tải video mới, xóa video cũ, cập nhật cache.
- Có thể tích hợp WebSocket để nhận lệnh cập nhật ngay lập tức.

## 3. Server Backend
- Xây dựng API:
  - /api/device/register
  - /api/device/playlist
  - /api/device/report
  - /api/admin/upload
  - /api/admin/playlist
- Backend dùng NodeJS/NestJS hoặc bất kỳ công nghệ phù hợp.
- Triển khai WebSocket server để push cập nhật.
- Lưu metadata playlist và thiết bị trong database (PostgreSQL/MySQL).

## 4. Dashboard quản trị
- Upload video.
- Tạo playlist 3 video.
- Gán playlist cho từng thiết bị.
- Theo dõi trạng thái online/offline.
- Nút gửi lệnh cập nhật realtime.

## 5. Lưu trữ video & CDN
- Dùng Cloudflare R2 hoặc AWS S3.
- Video được upload tại dashboard → lưu vào storage.
- Backend trả về URL video đã CDN hóa.

## 6. Kiến trúc tổng thể
- Trình bày đầy đủ các thành phần: Client → API → WebSocket → Database → Storage/CDN.
- Vẽ hoặc mô tả luồng hoạt động chi tiết giữa các thành phần.

## 7. Output mong muốn
- Cung cấp bản thiết kế đầy đủ (full architecture).
- Đưa ra cấu trúc file dự án cho frontend, backend.
- Tạo mẫu API contract.
- Đề xuất giải pháp bảo mật, tối ưu.
- Đưa ra checklist triển khai thực tế.
- Đưa ra chi phí dự kiến.

Hãy trình bày mọi thứ rõ ràng, chi tiết, có cấu trúc chuyên nghiệp, và output ra toàn bộ blueprint hoàn chỉnh của dự án.
"""

