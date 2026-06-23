import { User } from './user.entity';
export declare enum ReportReason {
    SPAM = "spam",
    HARASSMENT = "harassment",
    INAPPROPRIATE = "inappropriate",
    CHEATING = "cheating",
    OTHER = "other"
}
export declare class Report {
    id: string;
    reporterId: string;
    reporter: User;
    reportedId: string;
    reported: User;
    reason: ReportReason;
    description: string;
    resolved: boolean;
    createdAt: Date;
}
