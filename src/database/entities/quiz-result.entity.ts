import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Quiz } from './quiz.entity';

@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.quizResults)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  quizId: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'int' })
  totalQuestions: number;

  @Column({ type: 'int' })
  correctAnswers: number;

  @Column({ type: 'int' })
  incorrectAnswers: number;

  @Column({ type: 'int' })
  timeTaken: number;

  @Column({ type: 'int', array: true, default: [] })
  answers: number[];

  @CreateDateColumn()
  completedAt: Date;
}
