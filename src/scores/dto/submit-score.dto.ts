import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import type { GameId } from '../score.entity';

export const GAME_IDS: readonly GameId[] = [
  'rps',
  'guess',
  'ttt',
  'memory',
  'reaction',
];

export class SubmitScoreDto {
  @IsIn(GAME_IDS)
  gameId!: GameId;

  @IsString()
  @Length(1, 40)
  playerName!: string;

  @IsInt()
  score!: number;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}
