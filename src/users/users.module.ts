import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../database/entities/user.entity';
import { Follow } from '../database/entities/follow.entity';
import { Report } from '../database/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Report])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
