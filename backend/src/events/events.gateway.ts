import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DevicesService } from '../devices/devices.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map socketId -> deviceId
  private connectedDevices = new Map<string, number>();

  constructor(private devicesService: DevicesService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const deviceId = this.connectedDevices.get(client.id);
    if (deviceId) {
      await this.devicesService.updateStatus(deviceId, 'offline');
      this.connectedDevices.delete(client.id);
      this.server.emit('device-status-update', { deviceId, status: 'offline' });
    }
  }

  @SubscribeMessage('register-device')
  async handleRegisterDevice(@MessageBody() data: { deviceId: number }, @ConnectedSocket() client: Socket) {
    console.log(`Device registered: ${data.deviceId} on socket ${client.id}`);
    this.connectedDevices.set(client.id, data.deviceId);
    await this.devicesService.updateStatus(data.deviceId, 'online');
    this.server.emit('device-status-update', { deviceId: data.deviceId, status: 'online' });
  }

  @SubscribeMessage('identity')
  handleIdentity(@MessageBody() data: any): string {
    return 'identified';
  }

  @SubscribeMessage('request-server-time')
  handleRequestServerTime(@ConnectedSocket() client: Socket) {
    client.emit('server-time', { timestamp: Date.now() });
  }

  notifyPlaylistUpdate(deviceId: string, playlistId: number) {
    this.server.emit(`playlist-update-${deviceId}`, { playlistId });
    this.server.emit('playlist-update-all', { playlistId });
  }
}
