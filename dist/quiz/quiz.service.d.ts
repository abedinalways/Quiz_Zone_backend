import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Quiz } from '../database/entities/quiz.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';
import { QuizCategory } from '../database/entities/quiz-category.entity';
import { User } from '../database/entities/user.entity';
export declare class QuizService {
    private quizRepository;
    private resultRepository;
    private categoryRepository;
    private usersRepository;
    private configService;
    private readonly FREE_QUIZZES_LIMIT;
    constructor(quizRepository: Repository<Quiz>, resultRepository: Repository<QuizResult>, categoryRepository: Repository<QuizCategory>, usersRepository: Repository<User>, configService: ConfigService);
    findAll(params: {
        page?: number;
        limit?: number;
        category?: string;
        difficulty?: string;
        search?: string;
    }): Promise<{
        data: Quiz[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<Quiz>;
    getCategories(): Promise<QuizCategory[]>;
    submitQuiz(userId: string, quizId: string, answers: number[], timeTaken: number): Promise<QuizResult>;
    getMyResults(userId: string, page?: number, limit?: number): Promise<{
        data: QuizResult[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getResult(id: string): Promise<QuizResult>;
    getLeaderboard(quizId?: string, global?: boolean): Promise<any>;
    private canTakeQuiz;
    createQuiz(data: Partial<Quiz>): Promise<Quiz>;
    updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz | null>;
    deleteQuiz(id: string): Promise<{
        message: string;
    }>;
}
