import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { MediaFile } from './media-file.entity.js';

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

  @OneToMany(() => MediaFile, (file) => file.movie)
  files!: Relation<MediaFile[]>;
}
