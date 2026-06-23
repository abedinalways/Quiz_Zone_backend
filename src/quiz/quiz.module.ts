import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { Quiz } from '../database/entities/quiz.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';
import { QuizCategory } from '../database/entities/quiz-category.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, QuizResult, QuizCategory, User]),
    ConfigModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
