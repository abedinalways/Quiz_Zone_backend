"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../database/entities/message.entity");
const user_entity_1 = require("../database/entities/user.entity");
let MessagesService = class MessagesService {
    messagesRepository;
    usersRepository;
    constructor(messagesRepository, usersRepository) {
        this.messagesRepository = messagesRepository;
        this.usersRepository = usersRepository;
    }
    async getConversations(userId) {
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
            }
            else if (msg.receiverId === userId && !msg.read) {
                conversationMap.get(otherUserId).unreadCount++;
            }
        }
        return Array.from(conversationMap.values());
    }
    async getMessages(userId, otherUserId, page = 1, limit = 50) {
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
    async sendMessage(senderId, receiverId, content) {
        const receiver = await this.usersRepository.findOne({ where: { id: receiverId } });
        if (!receiver)
            throw new common_1.NotFoundException('Receiver not found');
        const message = this.messagesRepository.create({
            senderId,
            receiverId,
            content,
        });
        return this.messagesRepository.save(message);
    }
    async markAsRead(messageId) {
        await this.messagesRepository.update(messageId, { read: true });
        return { message: 'Marked as read' };
    }
    async deleteMessage(messageId) {
        await this.messagesRepository.delete(messageId);
        return { message: 'Message deleted' };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map