import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';

@Controller('playlists')
export class PlaylistsController {
    constructor(private readonly playlistsService: PlaylistsService) { }

    @Post()
    create(@Body() createPlaylistDto: { name: string; items: { url: string; duration: number; type: 'video' | 'image'; filename: string }[] }) {
        return this.playlistsService.create(createPlaylistDto);
    }

    @Get()
    findAll() {
        return this.playlistsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.playlistsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePlaylistDto: { name?: string; items?: { url: string; duration: number; type: 'video' | 'image'; filename: string }[] }) {
        return this.playlistsService.update(+id, updatePlaylistDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.playlistsService.remove(+id);
    }

    @Post(':id/deploy')
    deploy(@Param('id') id: string) {
        return this.playlistsService.deploy(+id);
    }
}
