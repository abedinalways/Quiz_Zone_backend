import { User, SubscriptionStatus } from './user.entity';
export declare enum PlanType {
    MONTHLY = "monthly",
    YEARLY = "yearly",
    LIFETIME = "lifetime"
}
export declare class Subscription {
    id: string;
    userId: string;
    user: User;
    plan: PlanType;
    status: SubscriptionStatus;
    price: number;
    startDate: Date;
    endDate: Date;
    stripeSubscriptionId: string;
    stripePaymentId: string;
    createdAt: Date;
}
