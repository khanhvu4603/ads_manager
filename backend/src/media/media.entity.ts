import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Media {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @Column()
    url: string;

    @Column()
    size: number;

    @Column({ type: 'float', default: 0 })
    duration: number;

    @Column()
    mimeType: string;

    @CreateDateColumn()
    createdAt: Date;
}
