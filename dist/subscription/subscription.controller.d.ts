import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getMySubscription(userId: string): Promise<import("../database/entities/subscription.entity").Subscription | null>;
    getPlans(): {
        id: string;
        name: string;
        price: number;
        interval: string;
        features: string[];
    }[];
    createCheckout(userId: string, body: {
        priceId: string;
        plan: string;
    }): Promise<{
        sessionId: string;
        url: string | null;
    }>;
    handleWebhook(signature: string, req: any): Promise<{
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
