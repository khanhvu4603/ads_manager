import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
    constructor(private readonly devicesService: DevicesService) { }

    @Post('register')
    register(@Body() body: { ip: string; name?: string }) {
        return this.devicesService.register(body.ip, body.name);
    }

    @Get()
    findAll() {
        return this.devicesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.devicesService.findOne(+id);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.devicesService.updateStatus(+id, body.status);
    }
}
