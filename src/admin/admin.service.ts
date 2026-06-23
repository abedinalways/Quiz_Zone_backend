import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Quiz } from '../database/entities/quiz.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { Report } from '../database/entities/report.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(QuizResult)
    private resultsRepository: Repository<QuizResult>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalQuizzes, totalSubscriptions, totalResults] =
      await Promise.all([
        this.usersRepository.count(),
        this.quizzesRepository.count(),
        this.subscriptionsRepository.count({
          where: { status: 'active' as any },
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

  async resolveReport(id: string) {
    await this.reportsRepository.update(id, { resolved: true });
    return { message: 'Report resolved' };
  }
}
