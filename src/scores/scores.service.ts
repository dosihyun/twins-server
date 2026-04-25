import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameId, Score } from './score.entity';
import { SubmitScoreDto } from './dto/submit-score.dto';

// Reaction is a "lower is better" game (milliseconds).
const LOWER_IS_BETTER: Record<GameId, boolean> = {
  rps: false,
  guess: true, // fewer attempts is better
  ttt: false,
  memory: true, // fewer moves is better
  reaction: true,
};

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private readonly repo: Repository<Score>,
  ) {}

  submit(dto: SubmitScoreDto): Promise<Score> {
    const row = this.repo.create({
      gameId: dto.gameId,
      playerName: dto.playerName.trim(),
      score: dto.score,
      meta: dto.meta ?? null,
    });
    return this.repo.save(row);
  }

  leaderboard(gameId: GameId, limit = 10): Promise<Score[]> {
    const order: 'ASC' | 'DESC' = LOWER_IS_BETTER[gameId] ? 'ASC' : 'DESC';
    return this.repo.find({
      where: { gameId },
      order: { score: order, createdAt: 'ASC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  }

  recent(gameId: GameId, limit = 20): Promise<Score[]> {
    return this.repo.find({
      where: { gameId },
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  }
}
