import { IsIn, IsInt, IsObject, IsOptional, IsString, Length } from 'class-validator';

export const GAME_IDS = ['rps', 'guess', 'ttt', 'memory', 'reaction'] as const;
export type GameId = (typeof GAME_IDS)[number];

export class SubmitScoreDto {
  @IsIn(GAME_IDS as readonly string[])
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
