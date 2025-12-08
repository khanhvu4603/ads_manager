# Hướng Dẫn Chi Tiết Deploy Backend & Database Lên Railway

Tài liệu này sẽ hướng dẫn bạn từng bước một (kèm hình dung) để đưa Backend (NestJS) và Database (MySQL) lên Railway.app.

## Chuẩn Bị Trước

1.  **Code trên GitHub**: Đảm bảo code của bạn đã được đẩy lên GitHub.
2.  **Tài khoản Railway**: Đăng ký tại [railway.app](https://railway.app) (có thể login bằng GitHub).
3.  **Thẻ Visa/Mastercard (ảo cũng được)**: Railway cần verify thẻ để kích hoạt gói Trial $5 (họ sẽ không trừ tiền ngay).

---

## Phần 1: Tạo Database (MySQL) trên Railway

Đây là nơi lưu trữ dữ liệu quảng cáo, user, playlist của bạn.

1.  Tại Dashboard của Railway, bấm nút **+ New Project** (màu tím).
2.  Chọn **Provision PostgreSQL / MySQL / Redis**.
3.  Chọn **MySQL**.
4.  Chờ khoảng 1-2 phút để Railway khởi tạo database cho bạn.
5.  Sau khi tạo xong, bạn sẽ thấy một khối hình chữ nhật ghi là `MySQL`. Bấm vào nó.
6.  Chọn tab **Variables**. Tại đây bạn sẽ thấy các thông tin quan trọng (dùng để điền vào Backend lát nữa):
    - `MYSQL_HOST` (ví dụ: `junction.proxy.rlwy.net`)
    - `MYSQL_PORT` (ví dụ: `54321`)
    - `MYSQL_USER` (thường là `root`)
    - `MYSQL_PASSWORD` (mật khẩu dài ngoằng)
    - `MYSQL_DATABASE` (thường là `railway`)

---

## Phần 2: Deploy Backend (NestJS)

Bây giờ chúng ta sẽ đưa code Backend lên chạy và kết nối với Database vừa tạo.

1.  Trong cùng Project đó, bấm nút **+ New** (hoặc chuột phải vào vùng trống chọn New Service).
2.  Chọn **GitHub Repo**.
3.  Tìm và chọn repository `ads_manager` của bạn.
4.  Ngay lập tức Railway sẽ cố gắng build (và có thể fail, đừng lo). Bấm vào khối Service mới vừa hiện ra (thường tên là trùng tên repo).

### Cấu hình thư mục gốc (Quan trọng vì bạn dùng Monorepo)

5.  Vào tab **Settings** của Service Backend.
6.  Tìm mục **Root Directory**.
7.  Nhập vào: `/backend` (vì code NestJS của bạn nằm trong thư mục backend).
8.  Bấm dấu tích ✅ để lưu. Railway sẽ tự động build lại.

### Cấu hình Biến Môi Trường (Environment Variables)

Backend cần biết thông tin Database để kết nối. Bạn hãy mở file `.env` ở máy bạn ra (nếu có), so sánh và điền vào Railway như bảng dưới đây:

| Tên biến (Name) | Lấy giá trị ở đâu? | Giải thích |
| :--- | :--- | :--- |
| `DB_HOST` | **Railway MySQL** | Host kết nối Database (ví dụ: `junction.proxy.rlwy.net`) |
| `DB_PORT` | **Railway MySQL** | Port kết nối (ví dụ: `54321`) |
| `DB_USERNAME` | **Railway MySQL** | Thường là `root` |
| `DB_PASSWORD` | **Railway MySQL** | Password của database (quan trọng) |
| `DB_DATABASE` | **Railway MySQL** | Tên database (thường là `railway`) |
| `PORT` | **Railway tự cấp** | Bạn **KHÔNG CẦN** điền biến này (hoặc điền `3000` cũng được, Railway sẽ tự override). |
| `JWT_SECRET` | **Tự điền** | Copy từ file `.env` local của bạn hoặc tự bịa một chuỗi bí mật mới. |
| `GOOGLE_CLIENT_ID` | **Tự điền** | (Nếu có dùng Google Login) Copy từ `.env` local. |
| `GOOGLE_CLIENT_SECRET` | **Tự điền** | (Nếu có dùng Google Login) Copy từ `.env` local. |

**Lưu ý:** Để lấy thông tin `DB_*`, bạn quay lại service **MySQL** trên Railway -> Tab **Variables** -> Copy từng dòng tương ứng.

### Mẹo: Dùng tính năng "Raw Editor" cho nhanh (Nếu bạn muốn copy/paste)
Bạn có hỏi là copy "Raw" từ Database sang Backend được không? -> **ĐƯỢC, NHƯNG PHẢI SỬA TÊN**.

1. Vào service **MySQL** -> Tab **Variables** -> Bấm **Raw Editor** -> Copy hết.
2. Dán vào Notepad (trên máy tính).
3. **SỬA TÊN BIẾN** (Cực kỳ quan trọng, vì code của bạn dùng tên khác với tên mặc định của Railway):
   - Sửa `MYSQL_HOST` thành `DB_HOST`
   - Sửa `MYSQL_PORT` thành `DB_PORT`
   - Sửa `MYSQL_USER` thành `DB_USERNAME`
   - Sửa `MYSQL_PASSWORD` thành `DB_PASSWORD`
   - Sửa `MYSQL_DATABASE` thành `DB_DATABASE`
4. Thêm dòng `JWT_SECRET=...` vào cuối.
5. Copy tất cả đống đó -> Vào service **Backend** -> Tab **Variables** -> Bấm **Raw Editor** -> Dán vào -> Bấm **Update**.

### Tạo Domain để Client truy cập

11. Vào tab **Settings** -> Tìm mục **Networking**.
12. Bấm **Generate Domain**.
13. Bạn sẽ có một đường link dạng `backend-production.up.railway.app`. **Copy link này**, đây chính là API URL để cài vào Client.

---

## Phần 3: Kiểm tra

1.  Vào tab **Deployments**, xem log. Nếu thấy dòng chữ `Nest application successfully started` là thành công! 🚀
2.  Dữ liệu database lúc này đang trống. Database trên Railway **khác** database dưới máy bạn.

### Mẹo: Muốn xem/sửa dữ liệu trên Railway bằng DBeaver?
- Dùng đúng thông tin Host, Port, User, Password ở **Phần 1** để connect DBeaver trên máy bạn tới Railway.

---

## Bước Tiếp Theo

Sau khi Backend chạy ngon lành, bạn quay lại deploy Client và Dashboard lên Vercel. Nhớ set biến môi trường `VITE_API_URL` bên Vercel bằng cái domain bạn vừa tạo ở bước 12 nhé!
