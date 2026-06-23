import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(search?: string, page?: number): Promise<{
        data: import("../database/entities/user.entity").User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<import("../database/entities/user.entity").User>;
    follow(userId: string, targetId: string): Promise<import("../database/entities/follow.entity").Follow>;
    unfollow(userId: string, targetId: string): Promise<{
        message: string;
    }>;
    getFollowers(id: string): Promise<import("../database/entities/user.entity").User[]>;
    getFollowing(id: string): Promise<import("../database/entities/user.entity").User[]>;
    report(userId: string, body: {
        reportedId: string;
        reason: string;
        description: string;
    }): Promise<import("../database/entities/report.entity").Report>;
}
