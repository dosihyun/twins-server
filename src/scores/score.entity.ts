import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type GameId = 'rps' | 'guess' | 'ttt' | 'memory' | 'reaction';

@Entity({ name: 'game_scores' })
@Index(['gameId', 'score'])
@Index(['gameId', 'createdAt'])
export class Score {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'game_id', type: 'varchar', length: 32 })
  gameId!: GameId;

  @Column({ name: 'player_name', type: 'varchar', length: 40 })
  playerName!: string;

  // For reaction time we want a low score (ms) to win; for others, high.
  // The service decides ordering per game; we just store the raw number.
  @Column({ type: 'int' })
  score!: number;

  @Column({ name: 'meta_json', type: 'json', nullable: true })
  meta!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
