import { QuizService } from './quiz.service';
export declare class QuizController {
    private quizService;
    constructor(quizService: QuizService);
    findAll(page?: number, limit?: number, category?: string, difficulty?: string, search?: string): Promise<{
        data: import("../database/entities/quiz.entity").Quiz[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCategories(): Promise<import("../database/entities/quiz-category.entity").QuizCategory[]>;
    findById(id: string): Promise<import("../database/entities/quiz.entity").Quiz>;
    submitQuiz(userId: string, body: {
        quizId: string;
        answers: number[];
        timeTaken: number;
    }): Promise<import("../database/entities/quiz-result.entity").QuizResult>;
    getMyResults(userId: string, page?: number, limit?: number): Promise<{
        data: import("../database/entities/quiz-result.entity").QuizResult[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getResult(id: string): Promise<import("../database/entities/quiz-result.entity").QuizResult>;
    getLeaderboard(quizId?: string, global?: boolean): Promise<any>;
}
