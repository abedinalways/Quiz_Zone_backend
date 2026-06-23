import { Repository } from 'typeorm';
import { Message } from '../database/entities/message.entity';
import { User } from '../database/entities/user.entity';
export declare class MessagesService {
    private messagesRepository;
    private usersRepository;
    constructor(messagesRepository: Repository<Message>, usersRepository: Repository<User>);
    getConversations(userId: string): Promise<any[]>;
    getMessages(userId: string, otherUserId: string, page?: number, limit?: number): Promise<{
        data: Message[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    sendMessage(senderId: string, receiverId: string, content: string): Promise<Message>;
    markAsRead(messageId: string): Promise<{
        message: string;
    }>;
    deleteMessage(messageId: string): Promise<{
        message: string;
    }>;
}
