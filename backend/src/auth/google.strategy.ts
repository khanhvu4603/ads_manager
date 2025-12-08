import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'your-client-id',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'your-client-secret',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:4000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const user = await this.usersService.findOrCreateByGoogle(profile);
        done(null, user);
    }
}
