import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { MediaFile } from './media-file.entity.js';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  tmdbId!: number;

  @Column()
  title!: string;

  @Column({ type: 'integer', nullable: true })
  year!: number | null;

  @Column({ type: 'varchar', nullable: true })
  posterPath!: string | null;

  @Column({ type: 'text', nullable: true })
  overview!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tagline!: string | null;

  @Column({ type: 'integer', nullable: true })
  runtime!: number | null;

  @Column({ type: 'varchar', nullable: true })
  backdropPath!: string | null;

  @Column({ type: 'real', nullable: true })
  voteAverage!: number | null;

  @Column({ type: 'integer', nullable: true })
  voteCount!: number | null;

  @Column({ type: 'varchar', nullable: true })
  imdbId!: string | null;

  @ApiProperty({ type: () => [MediaFile] })
  @OneToMany(() => MediaFile, (file) => file.movie)
  files!: Relation<MediaFile[]>;
}
