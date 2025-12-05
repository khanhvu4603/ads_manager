import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { DevicesModule } from '../devices/devices.module';

@Module({
    imports: [DevicesModule],
    providers: [EventsGateway],
    exports: [EventsGateway],
})
export class EventsModule { }
