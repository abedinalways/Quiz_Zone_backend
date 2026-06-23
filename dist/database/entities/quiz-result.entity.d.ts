import { User } from './user.entity';
import { Quiz } from './quiz.entity';
export declare class QuizResult {
    id: string;
    userId: string;
    user: User;
    quizId: string;
    quiz: Quiz;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    timeTaken: number;
    answers: number[];
    completedAt: Date;
}
