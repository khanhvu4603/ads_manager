import { Controller, Get, Post, Param, Delete, Patch, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';

@Controller('media')
export class MediaController {
    constructor(
        private readonly mediaService: MediaService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('media_url') mediaUrl?: string
    ) {
        if (mediaUrl) {
            return this.mediaService.create(undefined, mediaUrl);
        }
        const result = await this.cloudinaryService.uploadFile(file);
        return this.mediaService.saveCloudinaryMedia(file, result.secure_url, result.duration);
    }

    @Get()
    findAll() {
        return this.mediaService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mediaService.remove(+id);
    }

    @Patch(':id/rename')
    rename(@Param('id') id: string, @Body('filename') filename: string) {
        return this.mediaService.rename(+id, filename);
    }
}
