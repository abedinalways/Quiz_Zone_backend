import { User } from './user.entity';
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    SYSTEM = "system"
}
export declare class Message {
    id: string;
    senderId: string;
    sender: User;
    receiverId: string;
    receiver: User;
    content: string;
    messageType: MessageType;
    read: boolean;
    createdAt: Date;
}
