"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const subscription_entity_1 = require("../database/entities/subscription.entity");
const user_entity_1 = require("../database/entities/user.entity");
const quiz_result_entity_1 = require("../database/entities/quiz-result.entity");
let SubscriptionService = class SubscriptionService {
    subscriptionsRepository;
    usersRepository;
    resultsRepository;
    configService;
    stripe;
    FREE_QUIZZES_LIMIT;
    constructor(subscriptionsRepository, usersRepository, resultsRepository, configService) {
        this.subscriptionsRepository = subscriptionsRepository;
        this.usersRepository = usersRepository;
        this.resultsRepository = resultsRepository;
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('stripe.secretKey') || '', {
            apiVersion: '2025-03-31',
        });
        this.FREE_QUIZZES_LIMIT = this.configService.get('freeQuizzes') || 50;
    }
    async getMySubscription(userId) {
        return this.subscriptionsRepository.findOne({
            where: { userId, status: user_entity_1.SubscriptionStatus.ACTIVE },
            order: { createdAt: 'DESC' },
        });
    }
    getPlans() {
        return [
            {
                id: 'monthly',
                name: 'Monthly',
                price: 9.99,
                interval: 'month',
                features: [
                    'Unlimited quizzes',
                    'Detailed analytics',
                    'Priority support',
                    'No ads',
                ],
            },
            {
                id: 'yearly',
                name: 'Yearly',
                price: 79.99,
                interval: 'year',
                features: [
                    'Everything in Monthly',
                    '2 months free',
                    'Early access to new quizzes',
                    'Custom avatar',
                ],
            },
            {
                id: 'lifetime',
                name: 'Lifetime',
                price: 199.99,
                interval: 'one-time',
                features: [
                    'Everything in Yearly',
                    'Lifetime access',
                    'Beta features',
                    'Special badge',
                ],
            },
        ];
    }
    async createCheckoutSession(userId, priceId, plan) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const priceMap = {
            monthly: 999,
            yearly: 7999,
            lifetime: 19999,
        };
        const amount = priceMap[plan];
        if (!amount)
            throw new common_1.BadRequestException('Invalid plan');
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `QuizZone ${plan} Plan`,
                            description: `Access to all quizzes and features`,
                        },
                        unit_amount: amount,
                        recurring: plan === 'lifetime' ? undefined : { interval: plan },
                    },
                    quantity: 1,
                },
            ],
            mode: plan === 'lifetime' ? 'payment' : 'subscription',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription?canceled=true`,
            metadata: {
                userId,
                plan,
            },
        });
        return { sessionId: session.id, url: session.url };
    }
    async handleStripeWebhook(signature, payload) {
        const webhookSecret = this.configService.get('stripe.webhookSecret');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan;
                if (userId && plan) {
                    const startDate = new Date();
                    const endDate = new Date();
                    if (plan === 'monthly')
                        endDate.setMonth(endDate.getMonth() + 1);
                    else if (plan === 'yearly')
                        endDate.setFullYear(endDate.getFullYear() + 1);
                    else if (plan === 'lifetime')
                        endDate.setFullYear(endDate.getFullYear() + 100);
                    const subscription = this.subscriptionsRepository.create({
                        userId,
                        plan,
                        status: user_entity_1.SubscriptionStatus.ACTIVE,
                        price: plan === 'monthly' ? 9.99 : plan === 'yearly' ? 79.99 : 199.99,
                        startDate,
                        endDate,
                        stripePaymentId: session.payment_intent,
                        stripeSubscriptionId: session.subscription,
                    });
                    await this.subscriptionsRepository.save(subscription);
                    await this.usersRepository.update(userId, {
                        subscription: user_entity_1.SubscriptionStatus.ACTIVE,
                        subscriptionExpiry: endDate,
                    });
                }
                break;
            }
        }
        return { received: true };
    }
    async cancelSubscription(userId) {
        const sub = await this.subscriptionsRepository.findOne({
            where: { userId, status: user_entity_1.SubscriptionStatus.ACTIVE },
        });
        if (!sub)
            throw new common_1.NotFoundException('No active subscription found');
        sub.status = user_entity_1.SubscriptionStatus.CANCELLED;
        await this.subscriptionsRepository.save(sub);
        await this.usersRepository.update(userId, {
            subscription: user_entity_1.SubscriptionStatus.CANCELLED,
        });
        return { message: 'Subscription cancelled' };
    }
    async getRemainingFreeQuizzes(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.subscription === user_entity_1.SubscriptionStatus.ACTIVE) {
            return { remaining: -1, hasSubscription: true };
        }
        const taken = await this.resultsRepository.count({ where: { userId } });
        const remaining = Math.max(0, this.FREE_QUIZZES_LIMIT - taken);
        return { remaining, hasSubscription: false };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(quiz_result_entity_1.QuizResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map