// library/entities/media-file.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Movie } from './movie.entity.js';

export enum MatchStatus {
  Unmatched = 'unmatched',
  Matched = 'matched',
  Manual = 'manual',
}

@Entity()
export class MediaFile {
  @PrimaryGeneratedColumn()
  id!: number;

  // relative to MEDIA_DIR, so it survives the Docker mount change
  @Column({ unique: true })
  relativePath!: string;

  @Column()
  parsedTitle!: string;

  @Column({ type: 'integer', nullable: true })
  parsedYear!: number | null;

  @Column({ type: 'integer' })
  sizeBytes!: number;

  @Column({
    type: 'simple-enum',
    enum: MatchStatus,
    default: MatchStatus.Unmatched,
  })
  matchStatus!: MatchStatus;

  @Column({ type: 'real', nullable: true })
  matchScore!: number | null;

  @ManyToOne(() => Movie, (movie) => movie.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  movie!: Relation<Movie> | null;
}
