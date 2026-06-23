import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../database/entities/message.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getConversations(userId: string) {
    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const conversationMap = new Map();
    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0,
        });
      } else if (msg.receiverId === userId && !msg.read) {
        conversationMap.get(otherUserId).unreadCount++;
      }
    }

    return Array.from(conversationMap.values());
  }

  async getMessages(userId: string, otherUserId: string, page = 1, limit = 50) {
    const [data, total] = await this.messagesRepository.findAndCount({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      relations: { sender: true, receiver: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data: data.reverse(), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const receiver = await this.usersRepository.findOne({ where: { id: receiverId } });
    if (!receiver) throw new NotFoundException('Receiver not found');

    const message = this.messagesRepository.create({
      senderId,
      receiverId,
      content,
    });
    return this.messagesRepository.save(message);
  }

  async markAsRead(messageId: string) {
    await this.messagesRepository.update(messageId, { read: true });
    return { message: 'Marked as read' };
  }

  async deleteMessage(messageId: string) {
    await this.messagesRepository.delete(messageId);
    return { message: 'Message deleted' };
  }
}
