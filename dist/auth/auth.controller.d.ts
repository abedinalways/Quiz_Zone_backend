import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
            role: import("../database/entities/user.entity").UserRole;
            quizzesTaken: number;
            totalScore: number;
            followersCount: number;
            followingCount: number;
            subscription: import("../database/entities/user.entity").SubscriptionStatus;
            subscriptionExpiry: Date;
            isVerified: boolean;
            quizResults: import("../database/entities/quiz-result.entity").QuizResult[];
            sentMessages: import("../database/entities/message.entity").Message[];
            receivedMessages: import("../database/entities/message.entity").Message[];
            notifications: import("../database/entities/notification.entity").Notification[];
            subscriptions: import("../database/entities/subscription.entity").Subscription[];
            following: import("../database/entities/follow.entity").Follow[];
            followers: import("../database/entities/follow.entity").Follow[];
            reportsMade: import("../database/entities/report.entity").Report[];
            reportsReceived: import("../database/entities/report.entity").Report[];
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
            role: import("../database/entities/user.entity").UserRole;
            quizzesTaken: number;
            totalScore: number;
            followersCount: number;
            followingCount: number;
            subscription: import("../database/entities/user.entity").SubscriptionStatus;
            subscriptionExpiry: Date;
            isVerified: boolean;
            quizResults: import("../database/entities/quiz-result.entity").QuizResult[];
            sentMessages: import("../database/entities/message.entity").Message[];
            receivedMessages: import("../database/entities/message.entity").Message[];
            notifications: import("../database/entities/notification.entity").Notification[];
            subscriptions: import("../database/entities/subscription.entity").Subscription[];
            following: import("../database/entities/follow.entity").Follow[];
            followers: import("../database/entities/follow.entity").Follow[];
            reportsMade: import("../database/entities/report.entity").Report[];
            reportsReceived: import("../database/entities/report.entity").Report[];
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    getProfile(userId: string): Promise<import("../database/entities/user.entity").User>;
    updateProfile(userId: string, data: any): Promise<import("../database/entities/user.entity").User | null>;
}
