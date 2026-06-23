import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Follow } from '../database/entities/follow.entity';
import { Report } from '../database/entities/report.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async findAll(search?: string, page = 1, limit = 20) {
    const query = this.usersRepository.createQueryBuilder('user');

    if (search) {
      query.where('user.name ILIKE :search OR user.email ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }

    const following = await this.usersRepository.findOne({
      where: { id: followingId },
    });
    if (!following) throw new NotFoundException('User not found');

    const existing = await this.followsRepository.findOne({
      where: { followerId, followingId },
    });
    if (existing) throw new ConflictException('Already following this user');

    const follow = this.followsRepository.create({ followerId, followingId });
    await this.followsRepository.save(follow);

    await this.usersRepository.increment({ id: followerId }, 'followingCount', 1);
    await this.usersRepository.increment({ id: followingId }, 'followersCount', 1);

    return follow;
  }

  async unfollow(followerId: string, followingId: string) {
    const follow = await this.followsRepository.findOne({
      where: { followerId, followingId },
    });
    if (!follow) throw new NotFoundException('Not following this user');

    await this.followsRepository.remove(follow);

    await this.usersRepository.decrement({ id: followerId }, 'followingCount', 1);
    await this.usersRepository.decrement({ id: followingId }, 'followersCount', 1);

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string) {
    const follows = await this.followsRepository.find({
      where: { followingId: userId },
      relations: { follower: true },
    });
    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: string) {
    const follows = await this.followsRepository.find({
      where: { followerId: userId },
      relations: { following: true },
    });
    return follows.map((f) => f.following);
  }

  async report(
    reporterId: string,
    reportedId: string,
    reason: string,
    description: string,
  ) {
    const reported = await this.usersRepository.findOne({
      where: { id: reportedId },
    });
    if (!reported) throw new NotFoundException('User not found');

    const report = this.reportsRepository.create({
      reporterId,
      reportedId,
      reason: reason as any,
      description,
    });
    return this.reportsRepository.save(report);
  }
}
