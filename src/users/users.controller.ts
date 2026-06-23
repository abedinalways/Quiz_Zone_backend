import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('search') search?: string, @Query('page') page?: number) {
    return this.usersService.findAll(search, page);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  follow(@CurrentUser('id') userId: string, @Param('id') targetId: string) {
    return this.usersService.follow(userId, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unfollow')
  unfollow(@CurrentUser('id') userId: string, @Param('id') targetId: string) {
    return this.usersService.unfollow(userId, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/followers')
  getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/following')
  getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('report')
  report(
    @CurrentUser('id') userId: string,
    @Body() body: { reportedId: string; reason: string; description: string },
  ) {
    return this.usersService.report(userId, body.reportedId, body.reason, body.description);
  }
}
