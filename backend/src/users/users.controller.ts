import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('admin')
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    @Roles('admin')
    create(@Body() body) {
        return this.usersService.create(body.username, body.password);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

    @Patch(':id/password')
    @Roles('admin')
    updatePassword(@Param('id') id: string, @Body() body) {
        return this.usersService.updatePassword(+id, body.password);
    }
}
