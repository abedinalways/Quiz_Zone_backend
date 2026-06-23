import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private connectedUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinChat(client: Socket, receiverId: string): void;
    handleLeaveChat(client: Socket, receiverId: string): void;
    handleMessage(client: Socket, data: {
        receiverId: string;
        content: string;
    }): Promise<void>;
    handleTyping(client: Socket, receiverId: string): void;
    handleStopTyping(client: Socket, receiverId: string): void;
    sendNotification(userId: string, notification: any): void;
}
