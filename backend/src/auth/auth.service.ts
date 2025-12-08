import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        console.log('ValidateUser found:', user); // DEBUG LOG
        if (user && user.password_hash) {
            const isMatch = await bcrypt.compare(pass, user.password_hash);
            if (isMatch) {
                const { password_hash, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        console.log('Login user object:', user); // DEBUG LOG
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                avatar_url: user.avatar_url,
                role: user.role
            }
        };
    }

    async register(user: any) {
        return this.usersService.create(user.username, user.password);
    }

    async googleLogin(req) {
        if (!req.user) {
            return 'No user from google';
        }
        return this.login(req.user);
    }
}
