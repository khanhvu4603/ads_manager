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
    mimeType: string;

    @CreateDateColumn()
    createdAt: Date;
}
