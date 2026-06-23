import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string, page?: number): Promise<{
        data: import("../database/entities/notification.entity").Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
    markAsRead(id: string): Promise<{
        message: string;
    }>;
    deleteNotification(id: string): Promise<{
        message: string;
    }>;
}
