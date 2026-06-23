import { User } from './user.entity';
export declare enum NotificationType {
    MESSAGE = "message",
    FOLLOW = "follow",
    QUIZ_RESULT = "quiz_result",
    ACHIEVEMENT = "achievement",
    SUBSCRIPTION = "subscription",
    REPORT = "report"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    link: string;
    createdAt: Date;
}
