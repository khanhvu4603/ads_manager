import { Controller, Request, Post, UseGuards, Body, Get, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() body) {
        return this.authService.register(body);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Request() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Request() req, @Res() res) {
        const { access_token, user } = await this.authService.login(req.user);
        // Redirect to frontend with token
        res.redirect(`http://localhost:5173/auth/callback?token=${access_token}&username=${user.username}&id=${user.id}`);
    }
}
