import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import type { Relation } from 'typeorm';
import { Movie } from './movie.entity.js';

@Entity()
export class WatchRecord {
  @PrimaryColumn() userId!: number;
  @PrimaryColumn() movieId!: number;
  @CreateDateColumn() watchedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: Relation<User>;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie!: Relation<Movie>;
}
