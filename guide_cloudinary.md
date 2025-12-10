# Hướng dẫn Tích hợp Cloudinary (Upload Ảnh/Video không cần thẻ Visa)

Tài liệu này hướng dẫn bạn đăng ký Cloudinary và tích hợp vào backend NestJS để giải quyết vấn đề mất ảnh khi deploy.

## Phần 1: Đăng ký & Lấy API Key

1.  Truy cập [Cloudinary.com](https://cloudinary.com/users/register/free).
2.  Đăng ký tài khoản (Sign up with Google cho nhanh).
3.  Sau khi vào Dashboard, bạn sẽ thấy mục **Product Environment Credentials** ở ngay trang chủ. Copy 3 thông tin quan trọng sau:
    -   **Cloud Name**
    -   **API Key**
    -   **API Secret**

---

## Phần 2: Cấu hình Backend NestJS

### 1. Cài đặt thư viện
Chạy lệnh sau trong thư mục `backend`:

```bash
cd backend
npm install cloudinary streamifier
npm install -D @types/streamifier
```

### 2. Cập nhật biến môi trường (.env)
Bổ sung vào file `.env` ở thư mục `backend`:

```env
CLOUDINARY_CLOUD_NAME= <Cloud Name của bạn>
CLOUDINARY_API_KEY= <API Key của bạn>
CLOUDINARY_API_SECRET= <API Secret của bạn>
```

### 3. Tạo Provider cho Cloudinary
Tạo file mới `src/upload/cloudinary.provider.ts`:

```typescript
import { v2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    return v2.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  },
  inject: [ConfigService],
};
```

### 4. Tạo Service Upload (CloudinaryService)
Tạo file mới `src/upload/cloudinary.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('streamifier');

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ads-manager', // Tên thư mục trên Cloudinary
          resource_type: 'auto', // Tự động nhận diện ảnh hoặc video
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      toStream.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
```

### 5. Cập nhật Upload Module
Trong file `src/upload/upload.module.ts` (hoặc `media.module.ts` tùy code cũ của bạn), hãy nhớ đăng ký Provider và Service:

```typescript
@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService, CloudinaryProvider],
})
export class MediaModule {}
```

---

## Phần 3: Cách gọi trong Controller

Trong `MediaController`, bạn sẽ sửa code upload như sau:

```typescript
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // ⚠️ Dùng memoryStorage thay vì diskStorage

@Post('upload')
@UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(), // Quan trọng: Lưu file vào RAM để đẩy lên Cloud
}))
async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file);
    
    // Lưu URL này vào database
    return {
        url: result.secure_url, // Đây là link ảnh trên mạng
        filename: result.public_id,
        mimeType: file.mimetype,
    };
}
```

## Kết quả
Sau khi làm xong các bước này và deploy lại:
1.  Bạn upload ảnh/video từ Dashboard.
2.  File sẽ bay thẳng lên máy chủ Cloudinary.
3.  Dù bạn có reset hay deploy lại server Railway bao nhiêu lần, file vẫn nằm an toàn trên Cloudinary.
