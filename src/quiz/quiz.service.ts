import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Quiz, QuizDifficulty, QuizStatus } from '../database/entities/quiz.entity';
import { QuizResult } from '../database/entities/quiz-result.entity';
import { QuizCategory } from '../database/entities/quiz-category.entity';
import { User, SubscriptionStatus } from '../database/entities/user.entity';

@Injectable()
export class QuizService {
  private readonly FREE_QUIZZES_LIMIT: number;

  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizResult)
    private resultRepository: Repository<QuizResult>,
    @InjectRepository(QuizCategory)
    private categoryRepository: Repository<QuizCategory>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.FREE_QUIZZES_LIMIT = this.configService.get('freeQuizzes') || 50;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, category, difficulty, search } = params;
    const query = this.quizRepository.createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.category', 'category')
      .where('quiz.status = :status', { status: QuizStatus.PUBLISHED });

    if (category) query.andWhere('quiz.categoryId = :category', { category });
    if (difficulty) query.andWhere('quiz.difficulty = :difficulty', { difficulty });
    if (search) {
      query.andWhere('quiz.title ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('quiz.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async getCategories() {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async submitQuiz(userId: string, quizId: string, answers: number[], timeTaken: number) {
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    const canAttempt = await this.canTakeQuiz(userId);
    if (!canAttempt) {
      throw new ForbiddenException('Free quiz limit reached. Please subscribe.');
    }

    let correctAnswers = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctOption) {
        correctAnswers++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const result = this.resultRepository.create({
      userId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      timeTaken,
      answers,
    });

    await this.resultRepository.save(result);

    // Update stats
    await this.usersRepository.increment({ id: userId }, 'quizzesTaken', 1);
    await this.usersRepository.increment({ id: userId }, 'totalScore', score);
    await this.quizRepository.increment({ id: quizId }, 'totalAttempts', 1);

    // Update average score
    const avgResult = await this.resultRepository
      .createQueryBuilder('result')
      .select('AVG(result.score)', 'avg')
      .where('result.quizId = :quizId', { quizId })
      .getRawOne();
    await this.quizRepository.update(quizId, {
      averageScore: Math.round(avgResult.avg),
    });

    return result;
  }

  async getMyResults(userId: string, page = 1, limit = 10) {
    const [data, total] = await this.resultRepository.findAndCount({
      where: { userId },
      relations: { quiz: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { completedAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getResult(id: string) {
    const result = await this.resultRepository.findOne({
      where: { id },
      relations: { quiz: true, user: true },
    });
    if (!result) throw new NotFoundException('Result not found');
    return result;
  }

  async getLeaderboard(quizId?: string, global = true) {
    let leaderboard;

    if (quizId) {
      leaderboard = await this.resultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.user', 'user')
        .where('result.quizId = :quizId', { quizId })
        .select([
          'result.score',
          'result.correctAnswers',
          'result.totalQuestions',
          'result.timeTaken',
          'user.id',
          'user.name',
          'user.avatar',
        ])
        .orderBy('result.score', 'DESC')
        .addOrderBy('result.timeTaken', 'ASC')
        .take(50)
        .getMany();
    } else {
      leaderboard = await this.resultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.user', 'user')
        .select([
          'result.userId',
          'SUM(result.score) as total_score',
          'COUNT(result.id) as quizzes_taken',
          'AVG(result.score) as avg_score',
        ])
        .groupBy('result.userId')
        .addGroupBy('user.id')
        .addSelect(['user.id', 'user.name', 'user.avatar'])
        .orderBy('total_score', 'DESC')
        .take(50)
        .getRawMany();
    }

    return leaderboard;
  }

  private async canTakeQuiz(userId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return false;
    if (user.subscription === SubscriptionStatus.ACTIVE) return true;

    const quizCount = await this.resultRepository.count({
      where: { userId },
    });
    return quizCount < this.FREE_QUIZZES_LIMIT;
  }

  // Admin methods
  async createQuiz(data: Partial<Quiz>) {
    const quiz = this.quizRepository.create(data);
    return this.quizRepository.save(quiz);
  }

  async updateQuiz(id: string, data: Partial<Quiz>) {
    await this.quizRepository.update(id, data);
    return this.quizRepository.findOne({ where: { id } });
  }

  async deleteQuiz(id: string) {
    const result = await this.quizRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Quiz not found');
    return { message: 'Quiz deleted' };
  }
}
