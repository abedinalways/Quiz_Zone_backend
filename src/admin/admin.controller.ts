import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { QuizService } from '../quiz/quiz.service';
import { Quiz } from '../database/entities/quiz.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private quizService: QuizService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('subscriptions')
  getSubscriptions(@Query('page') page?: number) {
    return this.adminService.getAllSubscriptions(page);
  }

  @Get('reports')
  getReports(@Query('page') page?: number) {
    return this.adminService.getReports(page);
  }

  @Post('reports/:id/resolve')
  resolveReport(@Param('id') id: string) {
    return this.adminService.resolveReport(id);
  }

  // Quiz management
  @Post('quizzes')
  createQuiz(@Body() data: Partial<Quiz>, @CurrentUser('id') userId: string) {
    return this.quizService.createQuiz({ ...data, createdById: userId });
  }

  @Post('quizzes/:id')
  updateQuiz(@Param('id') id: string, @Body() data: Partial<Quiz>) {
    return this.quizService.updateQuiz(id, data);
  }

  @Post('quizzes/:id/delete')
  deleteQuiz(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }
}
