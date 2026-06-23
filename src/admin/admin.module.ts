import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../database/entities/user.entity';
import { Quiz } from '../database/entities/quiz.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { Report } from '../database/entities/report.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Quiz, Subscription, Report, QuizResult]),
    QuizModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
