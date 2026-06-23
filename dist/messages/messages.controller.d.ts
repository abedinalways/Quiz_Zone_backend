import { MessagesService } from './messages.service';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    getConversations(userId: string): Promise<any[]>;
    getMessages(userId: string, otherUserId: string, page?: number): Promise<{
        data: import("../database/entities/message.entity").Message[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    sendMessage(userId: string, body: {
        receiverId: string;
        content: string;
    }): Promise<import("../database/entities/message.entity").Message>;
    markAsRead(id: string): Promise<{
        message: string;
    }>;
    deleteMessage(id: string): Promise<{
        message: string;
    }>;
}
