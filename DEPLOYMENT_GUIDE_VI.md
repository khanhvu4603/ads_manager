# Hướng Dẫn Deploy Dự Án (Client, Dashboard, Backend)

Dựa trên phân tích mã nguồn của bạn:
- **Client & Dashboard**: Là các ứng dụng React (Vite).
- **Backend**: Là NestJS có sử dụng **WebSockets** (`socket.io`) và **MySQL**.

## 1. Chiến Lược Deploy (Khuyên Dùng)

Bạn **NÊN** deploy `client` và `dashboard` tách biệt với `backend`.

| Thành phần | Nơi deploy khuyên dùng | Lý do |
| :--- | :--- | :--- |
| **Client** (Người xem) | **Vercel** | Miễn phí, cực nhanh, tối ưu cho React/Vite. |
| **Dashboard** (Admin) | **Vercel** | Giống Client. |
| **Backend API** | **Railway** hoặc **Render** | Backend của bạn dùng **WebSockets**. Vercel là môi trường "Serverless" nên **KHÔNG** hỗ trợ tốt kết nối WebSockets (socket sẽ bị ngắt liên tục). Bạn cần một server chạy liên tục (VPS/PaaS) như Railway. |
| **Database** (MySQL) | **Railway** hoặc **Aiven** | Cần một nơi chứa dữ liệu online. Railway có cung cấp MySQL đi kèm rất tiện. |

---

## 2. Các Bước Thực Hiện Chi Tiết

### Bước 1: Chuẩn bị Code (GitHub)
Đẩy toàn bộ code của bạn lên GitHub (hoặc GitLab). Tốt nhất là cấu trúc monorepo như hiện tại hoặc tách thành 3 repo riêng lẻ nếu muốn quản lý độc lập.

### Bước 2: Deploy Database & Backend (Trên Railway)

1.  Tạo tài khoản tại [Railway.app](https://railway.app/).
2.  Tạo **New Project** -> Chọn **Provision PostgreSQL/MySQL** (Chọn MySQL).
3.  Lấy thông tin kết nối (Host, User, Password, Port) từ tab *Variables* hoặc *Connect*.
4.  Trong cùng project đó, chọn **New** -> **GitHub Repo** -> Chọn repo code của bạn.
5.  Cấu hình **Root Directory** (nếu để chung repo):
    - Vào Settings của service vừa tạo -> Genaral -> Root Directory -> nhập `/backend`.
6.  Cấu hình **Environment Variables** (Tab Variables):
    - Nhập các biến giống file `.env` local của bạn nhưng thay đổi giá trị cho khớp với server online:
      - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: Lấy từ MySQL vừa tạo ở bước 2.
      - `PORT`: Railway tự cấp, nhưng NestJS cần được cấu hình để nghe port này (thường là `process.env.PORT`).
7.  Railway sẽ tự động build và chạy lệnh `npm run start:prod`.
8.  Sau khi deploy thành công, vào Settings -> **Domains** -> Generate Domain (ví dụ: `backend-production.up.railway.app`).

**Lưu ý quan trọng cho Backend:**
- Kiểm tra file `main.ts` và `events.gateway.ts`, đảm bảo CORS đã được mở (`origin: '*'`) hoặc trỏ đúng domain của Client/Dashboard trên Vercel sau này.

### Bước 3: Deploy Client & Dashboard (Trên Vercel)

1.  Tạo tài khoản tại [Vercel.com](https://vercel.com/).
2.  **Deploy Dashboard**:
    - Chọn **Add New Project** -> Import từ GitHub.
    - **Root Directory**: Chọn Edit -> chọn thư mục `dashboard`.
    - **Environment Variables**:
      - Thêm biến môi trường trỏ về Backend Railway (ví dụ: `VITE_API_URL` hoặc `VITE_SOCKET_URL`)
      - Giá trị: `https://backend-production.up.railway.app` (domain có được ở Bước 2).
    - Bấm **Deploy**.
3.  **Deploy Client**:
    - Làm tương tự Dashboard nhưng chọn thư mục `client`.
    - Cấu hình biến môi trường trỏ về cùng backend đó.

## 3. Câu Hỏi Thường Gặp

**Q: Tại sao không deploy Backend lên Vercel luôn?**
A: Vercel dùng cơ chế Serverless Functions. Nó sẽ "ngủ" khi không có ai gọi và chỉ "tỉnh" dậy trong vài giây để trả lời API.
- **Vấn đề 1:** Kết nối WebSockets cần giữ kết nối liên tục -> Vercel sẽ cắt kết nối này -> Tính năng realtime hỏng.
- **Vấn đề 2:** Kết nối Database sẽ bị khởi tạo lại liên tục -> Chậm và dễ lỗi "Too many connections".

**Q: Railway có miễn phí không?**
A: Railway có gói Trial $5 dùng thử, nhưng sau đó sẽ tính phí (rất rẻ, tầm vài $ nếu ít dùng). Nếu muốn hoàn toàn miễn phí cho Backend, bạn có thể thử **Render** (gói Free Web Service) nhưng nó sẽ ngủ đông (spin down) nếu không ai dùng 15 phút (khiến lần gọi đầu tiên bị chậm).

## 4. So Sánh Railway vs Render (Cho Dự Án Này)

| Tiêu chí | Railway | Render |
| :--- | :--- | :--- |
| **Dễ sử dụng** | ⭐⭐⭐⭐⭐ Cực kỳ dễ, giao diện trực quan. | ⭐⭐⭐⭐ Khá dễ, nhưng nhiều bước hơn xíu. |
| **MySQL Database** | Tích hợp sẵn, tạo 1 click là có. | Phải tạo riêng hoặc dùng PostgreSQL (Render không có MySQL free native). |
| **WebSockets** | Hỗ trợ tốt, kết nối ổn định. | Hỗ trợ tốt. |
| **Chi phí** | Trial $5, sau đó tính theo usage (Pay-as-you-go). Không có gói Free vĩnh viễn. | Có gói **Free vĩnh viễn** cho Web Service & Postgres (nhưng hay bị ngủ đông). |
| **Tốc độ deploy** | Rất nhanh. | Khá chậm (với gói Free). |
| **Khuyên dùng** | **Nên dùng Railway** vì setup MySQL + Backend NestJS cực lẹ, ít lỗi vặt. Chấp nhận trả vài $/tháng để ổn định. | Dùng Render nếu bạn **bắt buộc muốn miễn phí 100%** và chấp nhận web load chậm lần đầu. |

**Lời khuyên:** Dùng **Railway** cho Backend + Database là ổn định và ít đau đầu nhất cho người mới bắt đầu hoặc dự án cần sự ổn định.
