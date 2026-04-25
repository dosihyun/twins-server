import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { GAME_IDS, GameId, SubmitScoreDto } from './dto/submit-score.dto';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  @Post()
  submit(@Body() dto: SubmitScoreDto) {
    return this.scores.submit(dto);
  }

  @Get('leaderboard/:gameId')
  leaderboard(
    @Param('gameId') gameId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (!(GAME_IDS as readonly string[]).includes(gameId)) {
      throw new BadRequestException(`unknown gameId: ${gameId}`);
    }
    return this.scores.leaderboard(gameId as GameId, limit);
  }

  @Get('recent/:gameId')
  recent(
    @Param('gameId') gameId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (!(GAME_IDS as readonly string[]).includes(gameId)) {
      throw new BadRequestException(`unknown gameId: ${gameId}`);
    }
    return this.scores.recent(gameId as GameId, limit);
  }
}
