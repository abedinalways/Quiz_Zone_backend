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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../database/entities/user.entity");
const follow_entity_1 = require("../database/entities/follow.entity");
const report_entity_1 = require("../database/entities/report.entity");
let UsersService = class UsersService {
    usersRepository;
    followsRepository;
    reportsRepository;
    constructor(usersRepository, followsRepository, reportsRepository) {
        this.usersRepository = usersRepository;
        this.followsRepository = followsRepository;
        this.reportsRepository = reportsRepository;
    }
    async findAll(search, page = 1, limit = 20) {
        const query = this.usersRepository.createQueryBuilder('user');
        if (search) {
            query.where('user.name ILIKE :search OR user.email ILIKE :search', {
                search: `%${search}%`,
            });
        }
        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.createdAt', 'DESC')
            .getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async follow(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.ConflictException('Cannot follow yourself');
        }
        const following = await this.usersRepository.findOne({
            where: { id: followingId },
        });
        if (!following)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.followsRepository.findOne({
            where: { followerId, followingId },
        });
        if (existing)
            throw new common_1.ConflictException('Already following this user');
        const follow = this.followsRepository.create({ followerId, followingId });
        await this.followsRepository.save(follow);
        await this.usersRepository.increment({ id: followerId }, 'followingCount', 1);
        await this.usersRepository.increment({ id: followingId }, 'followersCount', 1);
        return follow;
    }
    async unfollow(followerId, followingId) {
        const follow = await this.followsRepository.findOne({
            where: { followerId, followingId },
        });
        if (!follow)
            throw new common_1.NotFoundException('Not following this user');
        await this.followsRepository.remove(follow);
        await this.usersRepository.decrement({ id: followerId }, 'followingCount', 1);
        await this.usersRepository.decrement({ id: followingId }, 'followersCount', 1);
        return { message: 'Unfollowed successfully' };
    }
    async getFollowers(userId) {
        const follows = await this.followsRepository.find({
            where: { followingId: userId },
            relations: { follower: true },
        });
        return follows.map((f) => f.follower);
    }
    async getFollowing(userId) {
        const follows = await this.followsRepository.find({
            where: { followerId: userId },
            relations: { following: true },
        });
        return follows.map((f) => f.following);
    }
    async report(reporterId, reportedId, reason, description) {
        const reported = await this.usersRepository.findOne({
            where: { id: reportedId },
        });
        if (!reported)
            throw new common_1.NotFoundException('User not found');
        const report = this.reportsRepository.create({
            reporterId,
            reportedId,
            reason: reason,
            description,
        });
        return this.reportsRepository.save(report);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __param(2, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map