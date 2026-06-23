import { AdminService } from './admin.service';
import { QuizService } from '../quiz/quiz.service';
import { Quiz } from '../database/entities/quiz.entity';
export declare class AdminController {
    private adminService;
    private quizService;
    constructor(adminService: AdminService, quizService: QuizService);
    getDashboard(): Promise<{
        totalUsers: number;
        totalQuizzes: number;
        activeSubscriptions: number;
        totalQuizAttempts: number;
        pendingReports: number;
    }>;
    getSubscriptions(page?: number): Promise<{
        data: import("../database/entities/subscription.entity").Subscription[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getReports(page?: number): Promise<{
        data: import("../database/entities/report.entity").Report[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    resolveReport(id: string): Promise<{
        message: string;
    }>;
    createQuiz(data: Partial<Quiz>, userId: string): Promise<Quiz>;
    updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz | null>;
    deleteQuiz(id: string): Promise<{
        message: string;
    }>;
}
