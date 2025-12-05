import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
    constructor(
        @InjectRepository(Media)
        private mediaRepository: Repository<Media>,
    ) { }

    create(file?: Express.Multer.File, mediaUrl?: string) {
        if (!file && !mediaUrl) {
            throw new Error('Either file or media_url must be provided');
        }

        let mediaData;

        if (file) {
            // Priority: File upload
            // Use originalname (user's custom name) instead of random filename
            mediaData = {
                filename: file.originalname,
                url: `/uploads/${file.filename}`,
                mimeType: file.mimetype,
            };
        } else if (mediaUrl) {
            // Fallback: External URL
            const filename = mediaUrl.split('/').pop() || 'external-media';
            const extension = filename.split('.').pop() || '';
            const mimeType = extension.match(/mp4|webm|mov/i) ? `video/${extension}` : `image/${extension}`;

            mediaData = {
                filename: filename,
                url: mediaUrl,
                mimeType: mimeType,
            };
        }

        const media = this.mediaRepository.create(mediaData);
        return this.mediaRepository.save(media);
    }

    findAll() {
        return this.mediaRepository.find();
    }

    async remove(id: number) {
        // Get the media record first to check if we need to delete a file
        const media = await this.mediaRepository.findOne({ where: { id } });

        if (media && media.url.startsWith('/uploads/')) {
            // Delete the physical file (only for local uploads, not external URLs)
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(process.cwd(), 'uploads', path.basename(media.url));

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error('Failed to delete file:', error);
            }
        }

        return this.mediaRepository.delete(id);
    }

    async rename(id: number, newFilename: string) {
        const media = await this.mediaRepository.findOne({ where: { id } });
        if (!media) {
            throw new Error('Media not found');
        }
        media.filename = newFilename;
        return this.mediaRepository.save(media);
    }
}
