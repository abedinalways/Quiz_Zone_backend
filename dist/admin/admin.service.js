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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../database/entities/user.entity");
const quiz_entity_1 = require("../database/entities/quiz.entity");
const subscription_entity_1 = require("../database/entities/subscription.entity");
const report_entity_1 = require("../database/entities/report.entity");
const quiz_result_entity_1 = require("../database/entities/quiz-result.entity");
let AdminService = class AdminService {
    usersRepository;
    quizzesRepository;
    subscriptionsRepository;
    reportsRepository;
    resultsRepository;
    constructor(usersRepository, quizzesRepository, subscriptionsRepository, reportsRepository, resultsRepository) {
        this.usersRepository = usersRepository;
        this.quizzesRepository = quizzesRepository;
        this.subscriptionsRepository = subscriptionsRepository;
        this.reportsRepository = reportsRepository;
        this.resultsRepository = resultsRepository;
    }
    async getDashboardStats() {
        const [totalUsers, totalQuizzes, totalSubscriptions, totalResults] = await Promise.all([
            this.usersRepository.count(),
            this.quizzesRepository.count(),
            this.subscriptionsRepository.count({
                where: { status: 'active' },
            }),
            this.resultsRepository.count(),
        ]);
        const pendingReports = await this.reportsRepository.count({
            where: { resolved: false },
        });
        return {
            totalUsers,
            totalQuizzes,
            activeSubscriptions: totalSubscriptions,
            totalQuizAttempts: totalResults,
            pendingReports,
        };
    }
    async getAllSubscriptions(page = 1, limit = 20) {
        const [data, total] = await this.subscriptionsRepository.findAndCount({
            relations: { user: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getReports(page = 1, limit = 20) {
        const [data, total] = await this.reportsRepository.findAndCount({
            relations: { reporter: true, reported: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async resolveReport(id) {
        await this.reportsRepository.update(id, { resolved: true });
        return { message: 'Report resolved' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(quiz_entity_1.Quiz)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(3, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(4, (0, typeorm_1.InjectRepository)(quiz_result_entity_1.QuizResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map