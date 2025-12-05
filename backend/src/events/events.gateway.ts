import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('identity')
  handleIdentity(@MessageBody() data: any): string {
    return 'identified';
  }

  notifyPlaylistUpdate(deviceId: string, playlistId: number) {
    this.server.emit(`playlist-update-${deviceId}`, { playlistId });
    this.server.emit('playlist-update-all', { playlistId });
  }
}
