import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  getConversations(@CurrentUser('id') userId: string) {
    return this.messagesService.getConversations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getMessages(
    @CurrentUser('id') userId: string,
    @Param('userId') otherUserId: string,
    @Query('page') page?: number,
  ) {
    return this.messagesService.getMessages(userId, otherUserId, page);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  sendMessage(
    @CurrentUser('id') userId: string,
    @Body() body: { receiverId: string; content: string },
  ) {
    return this.messagesService.sendMessage(userId, body.receiverId, body.content);
  }

  @UseGuards(JwtAuthGuard)
  @Put('read/:id')
  markAsRead(@Param('id') id: string) {
    return this.messagesService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteMessage(@Param('id') id: string) {
    return this.messagesService.deleteMessage(id);
  }
}
