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
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const quiz_entity_1 = require("../database/entities/quiz.entity");
const quiz_result_entity_1 = require("../database/entities/quiz-result.entity");
const quiz_category_entity_1 = require("../database/entities/quiz-category.entity");
const user_entity_1 = require("../database/entities/user.entity");
let QuizService = class QuizService {
    quizRepository;
    resultRepository;
    categoryRepository;
    usersRepository;
    configService;
    FREE_QUIZZES_LIMIT;
    constructor(quizRepository, resultRepository, categoryRepository, usersRepository, configService) {
        this.quizRepository = quizRepository;
        this.resultRepository = resultRepository;
        this.categoryRepository = categoryRepository;
        this.usersRepository = usersRepository;
        this.configService = configService;
        this.FREE_QUIZZES_LIMIT = this.configService.get('freeQuizzes') || 50;
    }
    async findAll(params) {
        const { page = 1, limit = 20, category, difficulty, search } = params;
        const query = this.quizRepository.createQueryBuilder('quiz')
            .leftJoinAndSelect('quiz.category', 'category')
            .where('quiz.status = :status', { status: quiz_entity_1.QuizStatus.PUBLISHED });
        if (category)
            query.andWhere('quiz.categoryId = :category', { category });
        if (difficulty)
            query.andWhere('quiz.difficulty = :difficulty', { difficulty });
        if (search) {
            query.andWhere('quiz.title ILIKE :search', { search: `%${search}%` });
        }
        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('quiz.createdAt', 'DESC')
            .getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findById(id) {
        const quiz = await this.quizRepository.findOne({
            where: { id },
            relations: { category: true },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async getCategories() {
        return this.categoryRepository.find({ order: { name: 'ASC' } });
    }
    async submitQuiz(userId, quizId, answers, timeTaken) {
        const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        const canAttempt = await this.canTakeQuiz(userId);
        if (!canAttempt) {
            throw new common_1.ForbiddenException('Free quiz limit reached. Please subscribe.');
        }
        let correctAnswers = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctOption) {
                correctAnswers++;
            }
        });
        const totalQuestions = quiz.questions.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const result = this.resultRepository.create({
            userId,
            quizId,
            score,
            totalQuestions,
            correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            timeTaken,
            answers,
        });
        await this.resultRepository.save(result);
        await this.usersRepository.increment({ id: userId }, 'quizzesTaken', 1);
        await this.usersRepository.increment({ id: userId }, 'totalScore', score);
        await this.quizRepository.increment({ id: quizId }, 'totalAttempts', 1);
        const avgResult = await this.resultRepository
            .createQueryBuilder('result')
            .select('AVG(result.score)', 'avg')
            .where('result.quizId = :quizId', { quizId })
            .getRawOne();
        await this.quizRepository.update(quizId, {
            averageScore: Math.round(avgResult.avg),
        });
        return result;
    }
    async getMyResults(userId, page = 1, limit = 10) {
        const [data, total] = await this.resultRepository.findAndCount({
            where: { userId },
            relations: { quiz: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { completedAt: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getResult(id) {
        const result = await this.resultRepository.findOne({
            where: { id },
            relations: { quiz: true, user: true },
        });
        if (!result)
            throw new common_1.NotFoundException('Result not found');
        return result;
    }
    async getLeaderboard(quizId, global = true) {
        let leaderboard;
        if (quizId) {
            leaderboard = await this.resultRepository
                .createQueryBuilder('result')
                .leftJoinAndSelect('result.user', 'user')
                .where('result.quizId = :quizId', { quizId })
                .select([
                'result.score',
                'result.correctAnswers',
                'result.totalQuestions',
                'result.timeTaken',
                'user.id',
                'user.name',
                'user.avatar',
            ])
                .orderBy('result.score', 'DESC')
                .addOrderBy('result.timeTaken', 'ASC')
                .take(50)
                .getMany();
        }
        else {
            leaderboard = await this.resultRepository
                .createQueryBuilder('result')
                .leftJoinAndSelect('result.user', 'user')
                .select([
                'result.userId',
                'SUM(result.score) as total_score',
                'COUNT(result.id) as quizzes_taken',
                'AVG(result.score) as avg_score',
            ])
                .groupBy('result.userId')
                .addGroupBy('user.id')
                .addSelect(['user.id', 'user.name', 'user.avatar'])
                .orderBy('total_score', 'DESC')
                .take(50)
                .getRawMany();
        }
        return leaderboard;
    }
    async canTakeQuiz(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            return false;
        if (user.subscription === user_entity_1.SubscriptionStatus.ACTIVE)
            return true;
        const quizCount = await this.resultRepository.count({
            where: { userId },
        });
        return quizCount < this.FREE_QUIZZES_LIMIT;
    }
    async createQuiz(data) {
        const quiz = this.quizRepository.create(data);
        return this.quizRepository.save(quiz);
    }
    async updateQuiz(id, data) {
        await this.quizRepository.update(id, data);
        return this.quizRepository.findOne({ where: { id } });
    }
    async deleteQuiz(id) {
        const result = await this.quizRepository.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Quiz not found');
        return { message: 'Quiz deleted' };
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quiz_entity_1.Quiz)),
    __param(1, (0, typeorm_1.InjectRepository)(quiz_result_entity_1.QuizResult)),
    __param(2, (0, typeorm_1.InjectRepository)(quiz_category_entity_1.QuizCategory)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map