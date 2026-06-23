import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Subscription } from '../database/entities/subscription.entity';
import { User } from '../database/entities/user.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';
export declare class SubscriptionService {
    private subscriptionsRepository;
    private usersRepository;
    private resultsRepository;
    private configService;
    private stripe;
    private readonly FREE_QUIZZES_LIMIT;
    constructor(subscriptionsRepository: Repository<Subscription>, usersRepository: Repository<User>, resultsRepository: Repository<QuizResult>, configService: ConfigService);
    getMySubscription(userId: string): Promise<Subscription | null>;
    getPlans(): {
        id: string;
        name: string;
        price: number;
        interval: string;
        features: string[];
    }[];
    createCheckoutSession(userId: string, priceId: string, plan: string): Promise<{
        sessionId: string;
        url: string | null;
    }>;
    handleStripeWebhook(signature: string, payload: Buffer): Promise<{
        received: boolean;
    }>;
    cancelSubscription(userId: string): Promise<{
        message: string;
    }>;
    getRemainingFreeQuizzes(userId: string): Promise<{
        remaining: number;
        hasSubscription: boolean;
    }>;
}
