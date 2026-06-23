import { User } from './user.entity';
import { Question } from './question.entity';
import { QuizResult } from './quiz-result.entity';
import { QuizCategory } from './quiz-category.entity';
export declare enum QuizDifficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export declare enum QuizStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare class Quiz {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    category: QuizCategory;
    difficulty: QuizDifficulty;
    timeLimit: number;
    passingScore: number;
    questions: Question[];
    status: QuizStatus;
    createdById: string;
    createdBy: User;
    totalAttempts: number;
    averageScore: number;
    results: QuizResult[];
    createdAt: Date;
    updatedAt: Date;
}
