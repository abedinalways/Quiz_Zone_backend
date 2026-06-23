import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';
import { QuizResult } from './quiz-result.entity';
import { QuizCategory } from './quiz-category.entity';

export enum QuizDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => QuizCategory, (category) => category.quizzes)
  @JoinColumn({ name: 'categoryId' })
  category: QuizCategory;

  @Column({
    type: 'enum',
    enum: QuizDifficulty,
    default: QuizDifficulty.MEDIUM,
  })
  difficulty: QuizDifficulty;

  @Column({ default: 10 })
  timeLimit: number;

  @Column({ default: 40 })
  passingScore: number;

  @Column({ type: 'jsonb' })
  questions: Question[];

  @Column({
    type: 'enum',
    enum: QuizStatus,
    default: QuizStatus.DRAFT,
  })
  status: QuizStatus;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ default: 0 })
  totalAttempts: number;

  @Column({ type: 'float', default: 0 })
  averageScore: number;

  @OneToMany(() => QuizResult, (result) => result.quiz)
  results: QuizResult[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
