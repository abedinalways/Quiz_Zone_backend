import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/quizzes')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
  ) {
    return this.quizService.findAll({ page, limit, category, difficulty, search });
  }

  @Get('categories')
  getCategories() {
    return this.quizService.getCategories();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.quizService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  submitQuiz(
    @CurrentUser('id') userId: string,
    @Body() body: { quizId: string; answers: number[]; timeTaken: number },
  ) {
    return this.quizService.submitQuiz(userId, body.quizId, body.answers, body.timeTaken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-results')
  getMyResults(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.quizService.getMyResults(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('result/:id')
  getResult(@Param('id') id: string) {
    return this.quizService.getResult(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  getLeaderboard(
    @Query('quizId') quizId?: string,
    @Query('global') global?: boolean,
  ) {
    return this.quizService.getLeaderboard(quizId, global !== false);
  }
}
