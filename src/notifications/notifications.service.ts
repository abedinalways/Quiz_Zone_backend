import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private chatGateway: ChatGateway,
  ) {}

  async getNotifications(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepository.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(id: string) {
    await this.notificationsRepository.update(id, { read: true });
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update(
      { userId, read: false },
      { read: true },
    );
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(id: string) {
    await this.notificationsRepository.delete(id);
    return { message: 'Notification deleted' };
  }

  async createNotification(data: {
    userId: string;
    type: any;
    title: string;
    message: string;
    link?: string;
  }) {
    const notification = this.notificationsRepository.create(data as any);
    const saved = await this.notificationsRepository.save(notification);
    this.chatGateway.sendNotification(data.userId, saved);
    return saved;
  }
}
