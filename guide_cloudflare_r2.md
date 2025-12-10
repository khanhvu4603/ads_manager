# Hướng dẫn Tích hợp Cloudflare R2 (Lưu trữ ảnh/video miễn phí băng thông)

Tài liệu này hướng dẫn bạn từng bước từ đăng ký tài khoản Cloudflare R2 đến khi tích hợp vào code backend NestJS của bạn.

## Phần 1: Thiết lập trên Cloudflare Dashboard

### 1. Tạo tài khoản & R2 Bucket
1.  Truy cập [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) và đăng ký/đăng nhập.
2.  Trong menu bên trái, chọn **R2**.
3.  Bấm **Create Bucket**.
4.  Đặt tên Bucket (ví dụ: `ads-manager-assets`).
5.  Để Location là `Automatic` hoặc chọn vùng gần bạn (ví dụ `APAC`).
6.  Bấm **Create Bucket**.

### 2. Tạo API Tokens (Quan trọng)
1.  Sau khi tạo Bucket, quay lại trang chủ R2.
2.  Bấm vào dòng chữ **Manage R2 API Tokens** (thường ở góc phải).
3.  Bấm **Create API Token**.
4.  **Permission**: Chọn **Admin Read & Write**.
5.  **TTL**: Chọn **Forever** (hoặc thời gian dài).
6.  Bấm **Create API Token**.
    > ⚠️ **LƯU NGAY CÁC THÔNG TIN SAU VÀO NOTEPAD:**
    > - **Access Key ID**
    > - **Secret Access Key**
    > - **Endpoint** (Dùng endpoint của S3 API, có dạng `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)

### 3. Bật Public Access (Để xem được ảnh)
1.  Vào Bucket vừa tạo > Tab **Settings**.
2.  Kéo xuống phần **R2.dev subdomain**.
3.  Bấm **Allow Access**.
4.  Copy đường link "Public URL" (ví dụ: `https://pub-xyz...r2.dev`). Dùng link này để xem ảnh sau khi upload.

---

## Phần 2: Tích hợp vào Project (Backend NestJS)

### 1. Cài đặt thư viện AWS SDK
Dù là Cloudflare nhưng R2 tương thích chuẩn S3 của AWS nên ta dùng thư viện AWS.
Chạy lệnh này ở thư mục `backend`:

```bash
cd backend
npm install @aws-sdk/client-s3 
npm install -D @types/multer
```

### 2. Cấu hình biến môi trường (.env)
Mở file `backend/.env` và thêm:

```env
R2_ACCOUNT_ID= <Lấy từ Endpoint, là chuỗi ký tự trước .r2.cloudflarestorage.com>
R2_ACCESS_KEY_ID= <Cái bạn vừa lưu>
R2_SECRET_ACCESS_KEY= <Cái bạn vừa lưu>
R2_BUCKET_NAME=ads-manager-assets
R2_PUBLIC_URL= <Link R2.dev subdomain bạn vừa bật>
```

### 3. Tạo Service Upload (R2Service)
Tạo file mới `backend/src/upload/r2.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get('R2_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Trả về URL công khai
    const publicUrl = this.configService.get('R2_PUBLIC_URL');
    return `${publicUrl}/${fileName}`;
  }
}
```

### 4. Sửa Controller upload
Thay vì lưu file vào đĩa cứng (`diskStorage`), ta dùng `memoryStorage` để lấy buffer rồi gửi lên R2.

Trong `media.controller.ts` (hoặc nơi xử lý upload của bạn):
```typescript
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // ⚠️ Quan trọng: dùng memoryStorage

@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  storage: memoryStorage() // Không lưu đĩa, lưu vào RAM đệm để upload lên Cloud
}))
async uploadMedia(@UploadedFile() file: Express.Multer.File) {
  // Gọi R2Service để upload
  const url = await this.r2Service.uploadFile(file);
  // Lưu url này vào database...
  return { url };
}
```

## Phần 3: Hoàn tất
- Sau khi code xong, bạn deploy lại backend lên Railway.
- Từ giờ, mọi file upload sẽ bay thẳng lên Cloudflare R2.
- Railway có reset server bao nhiêu lần thì ảnh của bạn vẫn an toàn trên mây.
