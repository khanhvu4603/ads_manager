import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';

@Injectable()
export class DevicesService {
    constructor(
        @InjectRepository(Device)
        private devicesRepository: Repository<Device>,
    ) { }

    async register(ip: string, name?: string): Promise<Device> {
        let device = await this.devicesRepository.findOne({ where: { ip } });
        if (!device) {
            device = this.devicesRepository.create({ ip, name: name || 'Unknown Device', status: 'online', lastSeen: new Date() });
        } else {
            device.status = 'online';
            device.lastSeen = new Date();
            if (name) device.name = name;
        }
        return this.devicesRepository.save(device);
    }

    findAll(): Promise<Device[]> {
        return this.devicesRepository.find({ relations: ['playlist'] });
    }

    findOne(id: number): Promise<Device | null> {
        return this.devicesRepository.findOne({ where: { id }, relations: ['playlist'] });
    }

    async updateStatus(id: number, status: string): Promise<void> {
        await this.devicesRepository.update(id, { status, lastSeen: new Date() });
    }

    async assignPlaylist(deviceId: number, playlistId: number): Promise<void> {
        await this.devicesRepository.update(deviceId, { playlist: { id: playlistId } });
    }
}
