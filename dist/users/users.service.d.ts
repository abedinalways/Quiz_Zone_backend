import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Follow } from '../database/entities/follow.entity';
import { Report } from '../database/entities/report.entity';
export declare class UsersService {
    private usersRepository;
    private followsRepository;
    private reportsRepository;
    constructor(usersRepository: Repository<User>, followsRepository: Repository<Follow>, reportsRepository: Repository<Report>);
    findAll(search?: string, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<User>;
    follow(followerId: string, followingId: string): Promise<Follow>;
    unfollow(followerId: string, followingId: string): Promise<{
        message: string;
    }>;
    getFollowers(userId: string): Promise<User[]>;
    getFollowing(userId: string): Promise<User[]>;
    report(reporterId: string, reportedId: string, reason: string, description: string): Promise<Report>;
}
