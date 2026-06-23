import { QuizResult } from './quiz-result.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { Subscription } from './subscription.entity';
import { Follow } from './follow.entity';
import { Report } from './report.entity';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class User {
    id: string;
    email: string;
    name: string;
    password: string;
    avatar: string;
    role: UserRole;
    quizzesTaken: number;
    totalScore: number;
    followersCount: number;
    followingCount: number;
    subscription: SubscriptionStatus;
    subscriptionExpiry: Date;
    isVerified: boolean;
    quizResults: QuizResult[];
    sentMessages: Message[];
    receivedMessages: Message[];
    notifications: Notification[];
    subscriptions: Subscription[];
    following: Follow[];
    followers: Follow[];
    reportsMade: Report[];
    reportsReceived: Report[];
    createdAt: Date;
    updatedAt: Date;
}
