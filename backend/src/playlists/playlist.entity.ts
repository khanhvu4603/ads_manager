import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Device } from '../devices/device.entity';

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: 1 })
    version: number;

    @Column('simple-json')
    items: { url: string; duration: number; type: 'video' | 'image'; filename: string }[];

    @OneToMany(() => Device, (device) => device.playlist)
    devices: Device[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
