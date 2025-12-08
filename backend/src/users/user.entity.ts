import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true })
    password_hash: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ nullable: true })
    google_id: string;

    @Column({ nullable: true })
    avatar_url: string;

    @Column({ default: 'user' })
    role: string;

    @CreateDateColumn()
    created_at: Date;
}
