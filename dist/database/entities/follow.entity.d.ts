import { User } from './user.entity';
export declare class Follow {
    id: string;
    followerId: string;
    follower: User;
    followingId: string;
    following: User;
    createdAt: Date;
}
