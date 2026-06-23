import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        this.connectedUsers.set(payload.sub, client.id);
        client.data.userId = payload.sub;
      } catch (e) {
        client.disconnect();
      }
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join:chat')
  handleJoinChat(client: Socket, receiverId: string) {
    client.join(`chat:${receiverId}`);
  }

  @SubscribeMessage('leave:chat')
  handleLeaveChat(client: Socket, receiverId: string) {
    client.leave(`chat:${receiverId}`);
  }

  @SubscribeMessage('message:send')
  async handleMessage(client: Socket, data: { receiverId: string; content: string }) {
    const message = {
      senderId: client.data.userId,
      receiverId: data.receiverId,
      content: data.content,
      createdAt: new Date(),
      read: false,
    };

    // Send to receiver
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('message:receive', message);
    }

    // Send back to sender for confirmation
    client.emit('message:receive', message);
  }

  @SubscribeMessage('user:typing')
  handleTyping(client: Socket, receiverId: string) {
    const receiverSocketId = this.connectedUsers.get(receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('user:typing', client.data.userId);
    }
  }

  @SubscribeMessage('user:stop-typing')
  handleStopTyping(client: Socket, receiverId: string) {
    const receiverSocketId = this.connectedUsers.get(receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('user:stop-typing', client.data.userId);
    }
  }

  sendNotification(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification:receive', notification);
    }
  }
}
