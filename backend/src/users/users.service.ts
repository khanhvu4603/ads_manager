import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOne(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async create(username: string, pass: string): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(pass, salt);
        const user = this.usersRepository.create({
            username,
            password_hash: hash,
        });
        return this.usersRepository.save(user);
    }

    async findOrCreateByGoogle(profile: any): Promise<User> {
        let user = await this.usersRepository.findOne({ where: { google_id: profile.id } });
        if (!user) {
            user = this.usersRepository.create({
                google_id: profile.id,
                email: profile.emails[0].value,
                username: profile.displayName,
                avatar_url: profile.photos[0].value,
            });
            await this.usersRepository.save(user);
        }
        return user;
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async updatePassword(id: number, pass: string): Promise<void> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(pass, salt);
        await this.usersRepository.update(id, { password_hash: hash });
    }
}
