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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../database/entities/notification.entity");
const chat_gateway_1 = require("../chat/chat.gateway");
let NotificationsService = class NotificationsService {
    notificationsRepository;
    chatGateway;
    constructor(notificationsRepository, chatGateway) {
        this.notificationsRepository = notificationsRepository;
        this.chatGateway = chatGateway;
    }
    async getNotifications(userId, page = 1, limit = 20) {
        const [data, total] = await this.notificationsRepository.findAndCount({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getUnreadCount(userId) {
        const count = await this.notificationsRepository.count({
            where: { userId, read: false },
        });
        return { count };
    }
    async markAsRead(id) {
        await this.notificationsRepository.update(id, { read: true });
        return { message: 'Notification marked as read' };
    }
    async markAllAsRead(userId) {
        await this.notificationsRepository.update({ userId, read: false }, { read: true });
        return { message: 'All notifications marked as read' };
    }
    async deleteNotification(id) {
        await this.notificationsRepository.delete(id);
        return { message: 'Notification deleted' };
    }
    async createNotification(data) {
        const notification = this.notificationsRepository.create(data);
        const saved = await this.notificationsRepository.save(notification);
        this.chatGateway.sendNotification(data.userId, saved);
        return saved;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        chat_gateway_1.ChatGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map