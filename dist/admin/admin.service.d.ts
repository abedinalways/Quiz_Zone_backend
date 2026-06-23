import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Quiz } from '../database/entities/quiz.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { Report } from '../database/entities/report.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';
export declare class AdminService {
    private usersRepository;
    private quizzesRepository;
    private subscriptionsRepository;
    private reportsRepository;
    private resultsRepository;
    constructor(usersRepository: Repository<User>, quizzesRepository: Repository<Quiz>, subscriptionsRepository: Repository<Subscription>, reportsRepository: Repository<Report>, resultsRepository: Repository<QuizResult>);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalQuizzes: number;
        activeSubscriptions: number;
        totalQuizAttempts: number;
        pendingReports: number;
    }>;
    getAllSubscriptions(page?: number, limit?: number): Promise<{
        data: Subscription[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getReports(page?: number, limit?: number): Promise<{
        data: Report[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    resolveReport(id: string): Promise<{
        message: string;
    }>;
}
