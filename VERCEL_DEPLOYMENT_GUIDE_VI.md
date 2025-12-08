# Hướng Dẫn Deploy Client & Dashboard Lên Vercel (Kết Nối Backend Railway)

Tài liệu này hướng dẫn bạn đưa 2 trang web (Client xem quảng cáo & Dashboard quản lý) lên mạng và kết nối chúng với Backend đã chạy trên Railway.

## 0. Cập Nhật Code (Quan Trọng)

Tôi đã tự động sửa giúp bạn phần code để chấp nhận biến môi trường (Environment Variables) thay vì dùng cứng `localhost:4000`. Bạn cần đẩy code mới này lên GitHub trước khi bắt đầu.

```bash
git add .
git commit -m "Update API URL for production"
git push
```

---

## 1. Lấy API URL Từ Railway

Trước khi deploy, bạn cần biết địa chỉ Backend là gì.

1.  Vào [Railway.app](https://railway.app/).
2.  Vào project của bạn -> Chọn service **Backend** (NestJS).
3.  Vào tab **Settings** -> Mục **Networking**.
4.  Copy cái domain (ví dụ: `https://backend-production.up.railway.app`).

---

## 2. Deploy Dashboard (Trang Quản Trị)

1.  Đăng nhập [Vercel.com](https://vercel.com/) (bằng GitHub).
2.  Bấm **Add New...** -> **Project**.
3.  Chọn repo `ads_manager` của bạn -> Bấm **Import**.

### Cấu hình Dashboard
Trong màn hình "Configure Project":
1.  **Project Name**: Đặt tên (ví dụ: `ads-dashboard`).
2.  **Framework Preset**: Vercel tự nhận diện là `Vite`.
3.  **Root Directory** (Quan trọng):
    - Bấm nút **Edit**.
    - Chọn thư mục `dashboard`.
4.  **Environment Variables**:
    - Bấm vào mũi tên để mở rộng.
    - Thêm biến:
      - **Name**: `VITE_API_URL`
      - **Value**: Dán link Railway bạn copy ở Bước 1 vào (ví dụ: `https://backend-production.up.railway.app`).
    - Bấm **Add**.
5.  Bấm **Deploy**.

Chờ 1-2 phút, màn hình chúc mừng hiện ra. Bấm **Continue to Dashboard** -> Visit để xem trang quản trị của bạn đã online chưa!

---

## 3. Deploy Client (Trang Trình Chiếu)

Làm tương tự như Dashboard nhưng chọn thư mục khác.

1.  Về trang chủ Vercel.
2.  Bấm **Add New...** -> **Project**.
3.  Lại chọn repo `ads_manager` cũ (nó sẽ hiện chữ "Already Deployed" nhưng kệ nó, cứ chọn Import lại để tạo project mới).
4.  **Project Name**: Đặt tên (ví dụ: `ads-client` hoặc `ads-screen`).
5.  **Root Directory** (Quan trọng):
    - Bấm nút **Edit**.
    - Lần này chọn thư mục `client`.
6.  **Environment Variables**:
    - Thêm biến giống hệt bên Dashboard:
      - **Name**: `VITE_API_URL`
      - **Value**: `https://backend-production.up.railway.app`
    - Bấm **Add**.
7.  Bấm **Deploy**.

---

## 4. Kiểm Tra Kết Quả

1.  Mở Dashboard (link Vercel vừa tạo). Đăng nhập thử.
2.  Mở tab Media Library, thử upload một ảnh. Nếu upload được -> Kết nối Backend thành công!
3.  Mở Client (link Vercel vừa tạo, copy sang tab ẩn danh hoặc máy khác).
4.  Vào Dashboard -> Devices -> Xem có thấy thiết bị mới "Online" không.
5.  Thử tạo Playlist và Deploy -> Xem màn hình Client có tự tải video về chạy không.

### Lưu ý về WebSockets (Real-time) trên Vercel
Tôi đã code sẵn logic trong `App.jsx` để Client tự động kết nối Socket tới Railway (nơi Host biến `VITE_API_URL`). Vì Backend chạy trên Railway (Server thật) nên kết nối Socket sẽ ổn định, dù Client chạy trên Vercel.

Chúc mừng bạn đã hoàn thành hệ thống Digital Signage! 🚀
