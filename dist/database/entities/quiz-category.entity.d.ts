import { Quiz } from './quiz.entity';
export declare class QuizCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    quizCount: number;
    quizzes: Quiz[];
    createdAt: Date;
}
