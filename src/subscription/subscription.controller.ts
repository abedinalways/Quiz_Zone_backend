import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMySubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getMySubscription(userId);
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout')
  createCheckout(
    @CurrentUser('id') userId: string,
    @Body() body: { priceId: string; plan: string },
  ) {
    return this.subscriptionService.createCheckoutSession(
      userId,
      body.priceId,
      body.plan,
    );
  }

  @Post('webhook')
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    return this.subscriptionService.handleStripeWebhook(signature, req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  cancelSubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionService.cancelSubscription(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('free-quizzes-remaining')
  getRemainingFreeQuizzes(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getRemainingFreeQuizzes(userId);
  }
}
