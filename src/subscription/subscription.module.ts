import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Subscription } from '../database/entities/subscription.entity';
import { User } from '../database/entities/user.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, User, QuizResult]),
    ConfigModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
