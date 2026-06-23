import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { ChatGateway } from '../chat/chat.gateway';
export declare class NotificationsService {
    private notificationsRepository;
    private chatGateway;
    constructor(notificationsRepository: Repository<Notification>, chatGateway: ChatGateway);
    getNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<{
        message: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    deleteNotification(id: string): Promise<{
        message: string;
    }>;
    createNotification(data: {
        userId: string;
        type: any;
        title: string;
        message: string;
        link?: string;
    }): Promise<Notification[]>;
}
