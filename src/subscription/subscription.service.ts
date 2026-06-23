import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Subscription, PlanType } from '../database/entities/subscription.entity';
import { User, SubscriptionStatus } from '../database/entities/user.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  private readonly FREE_QUIZZES_LIMIT: number;

  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(QuizResult)
    private resultsRepository: Repository<QuizResult>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('stripe.secretKey') || '', {
      apiVersion: '2025-03-31' as any,
    });
    this.FREE_QUIZZES_LIMIT = this.configService.get('freeQuizzes') || 50;
  }

  async getMySubscription(userId: string) {
    return this.subscriptionsRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
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

  async createCheckoutSession(userId: string, priceId: string, plan: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const priceMap: Record<string, number> = {
      monthly: 999,
      yearly: 7999,
      lifetime: 19999,
    };

    const amount = priceMap[plan];
    if (!amount) throw new BadRequestException('Invalid plan');

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
            recurring:
              plan === 'lifetime' ? undefined : { interval: plan as 'month' | 'year' },
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

  async handleStripeWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('stripe.webhookSecret');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as PlanType;

        if (userId && plan) {
          const startDate = new Date();
          const endDate = new Date();

          if (plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
          else if (plan === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
          else if (plan === 'lifetime') endDate.setFullYear(endDate.getFullYear() + 100);

          const subscription = this.subscriptionsRepository.create({
            userId,
            plan,
            status: SubscriptionStatus.ACTIVE,
            price: plan === 'monthly' ? 9.99 : plan === 'yearly' ? 79.99 : 199.99,
            startDate,
            endDate,
            stripePaymentId: session.payment_intent as string,
            stripeSubscriptionId: session.subscription as string,
          });

          await this.subscriptionsRepository.save(subscription);

          await this.usersRepository.update(userId, {
            subscription: SubscriptionStatus.ACTIVE,
            subscriptionExpiry: endDate,
          });
        }
        break;
      }
    }

    return { received: true };
  }

  async cancelSubscription(userId: string) {
    const sub = await this.subscriptionsRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (!sub) throw new NotFoundException('No active subscription found');

    sub.status = SubscriptionStatus.CANCELLED;
    await this.subscriptionsRepository.save(sub);

    await this.usersRepository.update(userId, {
      subscription: SubscriptionStatus.CANCELLED,
    });

    return { message: 'Subscription cancelled' };
  }

  async getRemainingFreeQuizzes(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.subscription === SubscriptionStatus.ACTIVE) {
      return { remaining: -1, hasSubscription: true };
    }

    const taken = await this.resultsRepository.count({ where: { userId } });
    const remaining = Math.max(0, this.FREE_QUIZZES_LIMIT - taken);

    return { remaining, hasSubscription: false };
  }
}
