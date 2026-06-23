import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_categories')
export class QuizCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string;

  @Column({ default: 0 })
  quizCount: number;

  @OneToMany(() => Quiz, (quiz) => quiz.category)
  quizzes: Quiz[];

  @CreateDateColumn()
  createdAt: Date;
}
