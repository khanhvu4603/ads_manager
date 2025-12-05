import { Controller, Get, Post, Param, Delete, Patch, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('media_url') mediaUrl?: string
    ) {
        return this.mediaService.create(file, mediaUrl);
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
