import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MatchStatus,
  MediaFile,
} from '../movies/entities/media-file.entity.js';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ListFilesQueryDto } from './dto/list-files-query.dto.js';
import { TmdbClient } from '../metadata/tmdb.client.js';
import { Movie } from '../movies/entities/movie.entity.js';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly files: Repository<MediaFile>,
    private readonly tmdbClient: TmdbClient,
    @InjectRepository(Movie)
    private readonly movies: Repository<Movie>,
  ) {}

  findAll({ status, size, page }: ListFilesQueryDto) {
    const where: FindOptionsWhere<MediaFile> = {};
    if (status) where.matchStatus = status;

    return this.files.findAndCount({
      order: { parsedTitle: 'ASC', id: 'ASC' },
      where,
      take: size,
      skip: size * (page - 1),
    });
  }

  async findOne(id: number) {
    const file = await this.files.findOne({
      where: { id },
      relations: { movie: true },
    });
    if (!file)
      throw new NotFoundException(`Media file with ID ${id} not found `);
    return file;
  }
  async manualMatch({ fileId, tmdbId }: { fileId: number; tmdbId: number }) {
    const file = await this.files.findOne({
      where: { id: fileId },
      relations: { movie: true },
    });
    if (!file)
      throw new NotFoundException(`Media file with ID ${fileId} not found `);

    const tmdbMovie = await this.tmdbClient.getMovie(tmdbId);
    if (!tmdbMovie)
      throw new NotFoundException(`Tmdb movie with ID ${tmdbId} not found `);

    const previousMovieId = file.movie?.id;

    return this.files.manager.transaction(async (manager) => {
      let movie = await manager.findOneBy(Movie, { tmdbId });
      if (!movie) {
        const { id, originalTitle: _, ...fields } = tmdbMovie;
        movie = await manager.save(Movie, { tmdbId: id, ...fields });
      }

      file.movie = movie;
      file.matchStatus = MatchStatus.Manual;
      file.matchScore = null;
      const saved = await manager.save(file);

      // A wrong match leaves the old movie behind; drop it once no file points at it.
      if (previousMovieId !== undefined && previousMovieId !== movie.id) {
        const remaining = await manager.countBy(MediaFile, {
          movie: { id: previousMovieId },
        });
        if (remaining === 0) await manager.delete(Movie, previousMovieId);
      }

      return saved;
    });
  }
}
