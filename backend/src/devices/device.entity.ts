import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Playlist } from '../playlists/playlist.entity';

@Entity()
export class Device {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    ip: string;

    @Column({ default: 'offline' })
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    lastSeen: Date;

    @ManyToOne(() => Playlist, (playlist) => playlist.devices, { nullable: true })
    playlist: Playlist;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
