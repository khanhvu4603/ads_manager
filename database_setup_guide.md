# 🗄️ Hướng Dẫn Tạo Database MySQL Cho Ads Manager

> **Mục tiêu**: Tạo database `ads_manager` và cấu hình để backend NestJS kết nối thành công

---

## 📋 Yêu Cầu Trước Khi Bắt Đầu

- ✅ Đã cài đặt MySQL Server
- ✅ Đã cài đặt DBeaver Community Edition
- ⚠️ **Quan trọng**: Ghi nhớ mật khẩu root MySQL bạn đã đặt khi cài đặt

---

## 🚀 Bước 1: Kiểm Tra MySQL Đã Chạy

### **1.1. Kiểm tra MySQL Service**

1. Nhấn `Win + R`, gõ `services.msc`, nhấn Enter
2. Tìm service có tên **MySQL** hoặc **MySQL80** (số có thể khác tùy phiên bản)
3. Kiểm tra cột **Status**:
   - ✅ Nếu **Running** → Tốt, chuyển sang Bước 2
   - ❌ Nếu **Stopped** → Nhấp chuột phải → **Start**

### **1.2. Kiểm tra MySQL qua Command Line**

1. Mở **PowerShell** hoặc **Command Prompt** (chạy as Administrator)
2. Gõ lệnh:
   ```bash
   mysql --version
   ```
3. Nếu hiển thị version (VD: `mysql  Ver 8.0.x`) → MySQL đã cài đặt thành công ✅

---

## 🔧 Bước 2: Tạo Database Qua MySQL Command Line

### **2.1. Kết nối MySQL**

1. Mở **PowerShell** hoặc **Command Prompt**
2. Gõ lệnh:
   ```bash
   mysql -u root -p
   ```
3. Nhập mật khẩu root khi được yêu cầu (lưu ý: khi gõ mật khẩu sẽ không hiển thị ký tự nào)
4. Nếu thành công, bạn sẽ thấy prompt: `mysql>`

> **Lỗi thường gặp:**
> - `'mysql' is not recognized` → MySQL chưa được thêm vào PATH. Dùng full path: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p`
> - `Access denied` → Sai mật khẩu, thử lại hoặc reset password

### **2.2. Tạo Database**

Sau khi vào MySQL prompt, chạy các lệnh sau:

```sql
-- Tạo database với charset UTF8
CREATE DATABASE ads_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

✅ Kết quả: `Query OK, 1 row affected`

### **2.3. Tạo User Riêng Cho App (Recommended - Bảo mật hơn)**

```sql
-- Tạo user mới
CREATE USER 'ads_admin'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Gán quyền cho user trên database ads_manager
GRANT ALL PRIVILEGES ON ads_manager.* TO 'ads_admin'@'localhost';

-- Áp dụng thay đổi
FLUSH PRIVILEGES;
```

> **Lưu ý**: Thay `your_strong_password` bằng mật khẩu mạnh của bạn (VD: `Ads@2024#Secure`)

### **2.4. Kiểm Tra Database Đã Tạo**

```sql
-- Xem danh sách databases
SHOW DATABASES;
```

Bạn sẽ thấy `ads_manager` trong danh sách ✅

### **2.5. Thoát MySQL**

```sql
EXIT;
```

---

## 🔌 Bước 3: Kết Nối DBeaver Với MySQL

### **3.1. Mở DBeaver**

1. Khởi động **DBeaver Community Edition**
2. Nếu lần đầu mở, có thể có wizard hướng dẫn → chọn **Skip**

### **3.2. Tạo Kết Nối Mới**

1. Click vào biểu tượng **Plug with Plus** (New Database Connection) ở góc trên bên trái
   - Hoặc vào menu: **Database** → **New Database Connection**
2. Cửa sổ **Connect to a database** hiển thị

### **3.3. Chọn Database Type**

1. Tìm và chọn **MySQL** (logo cá heo màu xanh/cam)
2. Click **Next**

### **3.4. Điền Thông Tin Kết Nối**

Điền các thông tin sau:

| Field | Value | Ghi chú |
|-------|-------|---------|
| **Server Host** | `localhost` | Hoặc `127.0.0.1` |
| **Port** | `3306` | Port mặc định của MySQL |
| **Database** | `ads_manager` | Database vừa tạo |
| **Username** | `ads_admin` | Hoặc `root` nếu không tạo user mới |
| **Password** | `your_strong_password` | Mật khẩu của user |

✅ **Tick vào ô "Save password"** để không phải nhập lại mỗi lần

### **3.5. Test Connection**

1. Click nút **Test Connection...**
2. **Lần đầu tiên**: DBeaver sẽ hỏi tải MySQL Driver
   - Cửa sổ **Download Driver Files** xuất hiện
   - Click **Download** và đợi
3. Kết quả:
   - ✅ **"Connected"** → Thành công!
   - ❌ **Error** → Xem phần troubleshooting bên dưới

### **3.6. Hoàn Tất**

1. Click **Finish**
2. Kết nối MySQL sẽ xuất hiện ở panel **Database Navigator** bên trái

---

## 👀 Bước 4: Xem Database Trên DBeaver

### **4.1. Mở Kết Nối**

1. Trong **Database Navigator** (panel trái), tìm kết nối MySQL vừa tạo
2. **Double-click** vào kết nối để mở rộng
3. Mở rộng mục **Schemas** hoặc **Databases**

### **4.2. Xem Database ads_manager**

1. Tìm và click vào **ads_manager**
2. Mở rộng để thấy:
   - 📁 **Tables** (hiện tại rỗng - sẽ tự tạo sau khi chạy backend)
   - 📁 **Views**
   - 📁 **Procedures**
   - 📁 **Functions**

> **Lưu ý**: Hiện tại database chưa có tables. TypeORM sẽ tự động tạo tables khi chạy backend!

### **4.3. Chạy SQL Query Thử (Optional)**

1. Nhấp chuột phải vào **ads_manager** → **SQL Editor** → **Open SQL Script**
2. Gõ thử:
   ```sql
   SHOW TABLES;
   ```
3. Click biểu tượng **Execute** (▶️) hoặc nhấn `Ctrl + Enter`
4. Kết quả hiện tại: Empty set (vì chưa có tables)

---

## ⚙️ Bước 5: Cấu Hình Backend NestJS

### **5.1. Cập Nhật File .env**

1. Mở file: `e:\SOLARZ\ads_manager\backend\.env`
2. Sửa các dòng sau:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=ads_admin
DB_PASSWORD=your_strong_password
DB_DATABASE=ads_manager
PORT=3000
```

> **Quan trọng**: 
> - Nếu dùng user `root`, điền `DB_USERNAME=root` và mật khẩu root
> - Nếu tạo user `ads_admin`, điền như trên

### **5.2. Kiểm Tra TypeORM Config**

1. Mở file: `e:\SOLARZ\ads_manager\backend\src\app.module.ts`
2. Tìm phần `TypeOrmModule.forRoot()`
3. Đảm bảo có config:
   ```typescript
   TypeOrmModule.forRoot({
     type: 'mysql',
     host: process.env.DB_HOST,
     port: parseInt(process.env.DB_PORT),
     username: process.env.DB_USERNAME,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_DATABASE,
     entities: [__dirname + '/**/*.entity{.ts,.js}'],
     synchronize: true, // ⚠️ Chỉ dùng trong dev, tắt trong production
   })
   ```

---

## 🎯 Bước 6: Chạy Backend Và Tự Động Tạo Tables

### **6.1. Stop Backend Nếu Đang Chạy**

1. Trong terminal đang chạy `npm run start:dev`
2. Nhấn `Ctrl + C` để dừng

### **6.2. Restart Backend**

```bash
cd e:\SOLARZ\ads_manager\backend
npm run start:dev
```

### **6.3. Quan Sát Logs**

Bạn sẽ thấy logs tương tự:

```
[Nest] INFO [TypeOrmModule] Database connection established
[Nest] INFO [TypeOrmModule] Entity Metadata loaded: Media, Playlist, Device
```

✅ Thành công nếu **KHÔNG** thấy lỗi `ECONNREFUSED` hoặc `Access denied`

### **6.4. Verify Tables Đã Được Tạo**

#### **Cách 1: Qua DBeaver**
1. Quay lại DBeaver
2. Nhấp chuột phải vào **ads_manager** → **Refresh**
3. Mở rộng **Tables**
4. Bạn sẽ thấy 3 tables:
   - ✅ `media`
   - ✅ `playlist`
   - ✅ `device`

#### **Cách 2: Qua MySQL Command Line**
```bash
mysql -u ads_admin -p ads_manager
```
```sql
SHOW TABLES;
```

Kết quả:
```
+------------------------+
| Tables_in_ads_manager  |
+------------------------+
| device                 |
| media                  |
| playlist               |
+------------------------+
```

---

## 🎊 Bước 7: Kiểm Tra Cấu Trúc Tables

### **7.1. Xem Structure Của Table**

Trong DBeaver:
1. Mở rộng **Tables** → Click vào **media**
2. Tab **Columns** hiển thị:
   - `id` - INT - PK - AUTO_INCREMENT
   - `filename` - VARCHAR(255)
   - `url` - TEXT
   - `mimeType` - VARCHAR(100)
   - `createdAt` - DATETIME

3. Làm tương tự với **playlist** và **device**

### **7.2. Thử Insert Dữ Liệu Test**

```sql
-- Insert test media
INSERT INTO media (filename, url, mimeType) 
VALUES ('test_video.mp4', 'https://example.com/test.mp4', 'video/mp4');

-- Check data
SELECT * FROM media;
```

✅ Nếu thấy dữ liệu → Database hoạt động hoàn hảo!

---

## ❌ Troubleshooting - Xử Lý Lỗi Thường Gặp

### **Lỗi 1: "Access denied for user 'root'@'localhost'"**

**Nguyên nhân**: Sai mật khẩu

**Giải pháp**:
1. Reset mật khẩu root MySQL (Google: "reset mysql root password windows")
2. Hoặc tạo user mới như Bước 2.3

---

### **Lỗi 2: "Can't connect to MySQL server on 'localhost'"**

**Nguyên nhân**: MySQL service chưa chạy

**Giải pháp**:
1. Vào `services.msc`
2. Tìm MySQL service → Start
3. Hoặc chạy lệnh PowerShell (as Admin):
   ```powershell
   Start-Service MySQL80
   ```

---

### **Lỗi 3: Backend báo "ECONNREFUSED" khi chạy**

**Nguyên nhân**: Thông tin `.env` sai hoặc MySQL chưa chạy

**Giải pháp**:
1. Kiểm tra `.env`:
   - `DB_HOST=localhost`
   - `DB_PORT=3306`
   - Mật khẩu đúng
2. Test kết nối MySQL bằng DBeaver
3. Đảm bảo MySQL service đang chạy

---

### **Lỗi 4: DBeaver báo "Public Key Retrieval is not allowed"**

**Nguyên nhân**: Cấu hình bảo mật MySQL 8.0+

**Giải pháp**:
1. Trong DBeaver connection settings
2. Tab **Driver properties**
3. Tìm `allowPublicKeyRetrieval` → Set value: `true`
4. Click **OK** và test lại

---

### **Lỗi 5: Tables không được tạo tự động**

**Nguyên nhân**: `synchronize: false` trong TypeORM config

**Giải pháp**:
1. Mở `app.module.ts`
2. Đảm bảo `synchronize: true` (chỉ trong dev)
3. Restart backend

---

## 📊 Schema Tổng Quan

Sau khi setup xong, bạn sẽ có database với cấu trúc:

```
ads_manager/
├── media
│   ├── id (PK)
│   ├── filename
│   ├── url
│   ├── mimeType
│   └── createdAt
│
├── playlist
│   ├── id (PK)
│   ├── name
│   ├── version
│   ├── items (JSON)
│   ├── createdAt
│   └── updatedAt
│
└── device
    ├── id (PK)
    ├── name
    ├── ip
    ├── status
    ├── lastSeen
    ├── playlistId (FK → playlist.id)
    ├── createdAt
    └── updatedAt
```

---

## ✅ Checklist Hoàn Thành

- [ ] MySQL service đang chạy
- [ ] Database `ads_manager` đã tạo
- [ ] User `ads_admin` đã tạo (hoặc dùng root)
- [ ] DBeaver kết nối thành công
- [ ] File `.env` đã cấu hình đúng
- [ ] Backend chạy không lỗi
- [ ] 3 tables (media, playlist, device) đã được tạo tự động
- [ ] Có thể insert/query data thử nghiệm

---

## 🚀 Bước Tiếp Theo

Sau khi setup database xong:

1. ✅ Test các API endpoints:
   - `POST /api/media/upload` - Upload video
   - `GET /api/playlists` - Lấy danh sách playlist
   - `POST /api/devices/register` - Đăng ký device

2. ✅ Test Dashboard:
   - Upload video
   - Tạo playlist
   - Gán playlist cho device

3. ✅ Backup database định kỳ:
   ```bash
   mysqldump -u ads_admin -p ads_manager > backup_$(date +%Y%m%d).sql
   ```

---

## 🆘 Cần Trợ Giúp?

Nếu gặp lỗi khác, check:
1. **MySQL Error Log**: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
2. **Backend logs**: Console output khi chạy `npm run start:dev`
3. **DBeaver logs**: Help → Open Log Folder

---

**Chúc bạn thành công! 🎉**

*Được tạo cho project Ads Manager - Digital Signage System*
