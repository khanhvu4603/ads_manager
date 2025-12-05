import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './playlist.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PlaylistsService {
    constructor(
        @InjectRepository(Playlist)
        private playlistsRepository: Repository<Playlist>,
        private eventsGateway: EventsGateway,
    ) { }

    create(createPlaylistDto: { name: string; items: { url: string; duration: number; type: 'video' | 'image'; filename: string }[] }) {
        const playlist = this.playlistsRepository.create(createPlaylistDto);
        return this.playlistsRepository.save(playlist);
    }

    findAll() {
        return this.playlistsRepository.find({ relations: ['devices'] });
    }

    findOne(id: number): Promise<Playlist | null> {
        return this.playlistsRepository.findOne({ where: { id }, relations: ['devices'] });
    }

    async update(id: number, updatePlaylistDto: { name?: string; items?: { url: string; duration: number; type: 'video' | 'image'; filename: string }[] }) {
        const playlist = await this.findOne(id);
        if (!playlist) {
            throw new Error('Playlist not found');
        }
        if (updatePlaylistDto.name) playlist.name = updatePlaylistDto.name;
        if (updatePlaylistDto.items) {
            playlist.items = updatePlaylistDto.items;
            playlist.version += 1; // Increment version on update
        }
        const saved = await this.playlistsRepository.save(playlist);
        this.eventsGateway.notifyPlaylistUpdate('all', saved.id);
        return saved;
    }

    remove(id: number) {
        return this.playlistsRepository.delete(id);
    }

    async deploy(id: number) {
        const playlist = await this.findOne(id);
        if (!playlist) {
            throw new Error('Playlist not found');
        }
        // Broadcast to all connected clients
        this.eventsGateway.server.emit('playlistDeployed', playlist);
        return { success: true, message: 'Playlist deployed successfully', playlist };
    }
}
