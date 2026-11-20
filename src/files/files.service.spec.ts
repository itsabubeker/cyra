import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilesService } from './files.service.js';
import { TmdbClient } from '../metadata/tmdb.client.js';
import type { TmdbMovieDetailsDto } from '../metadata/dto/tmdb-movie.dto.js';
import {
  MatchStatus,
  MediaFile,
} from '../movies/entities/media-file.entity.js';
import { Movie } from '../movies/entities/movie.entity.js';
import { WatchRecord } from '../movies/entities/watch-record.entity.js';
import { User } from '../users/entities/user.entity.js';

function tmdbMovie(id: number, title: string): TmdbMovieDetailsDto {
  return {
    id,
    title,
    originalTitle: title,
    year: 2000,
    posterPath: null,
    overview: null,
    tagline: null,
    runtime: null,
    backdropPath: null,
    voteAverage: 0,
    voteCount: 0,
    imdbId: null,
  };
}

describe('FilesService.manualMatch', () => {
  let module: TestingModule;
  let service: FilesService;
  let files: Repository<MediaFile>;
  let movies: Repository<Movie>;
  let getMovie: ReturnType<typeof vi.fn>;

  const addFile = (relativePath: string, movie: Movie | null) =>
    files.save({
      relativePath,
      parsedTitle: relativePath,
      parsedYear: null,
      sizeBytes: 1,
      matchStatus: movie ? MatchStatus.Matched : MatchStatus.Unmatched,
      matchScore: movie ? 0.85 : null,
      movie,
    });

  beforeEach(async () => {
    getMovie = vi.fn((id: number) =>
      Promise.resolve(tmdbMovie(id, `Movie ${id}`)),
    );

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [MediaFile, Movie, WatchRecord, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([MediaFile, Movie]),
      ],
      providers: [
        FilesService,
        { provide: TmdbClient, useValue: { getMovie } },
      ],
    }).compile();

    service = module.get(FilesService);
    files = module.get(getRepositoryToken(MediaFile));
    movies = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => module.close());

  it('links the file to the chosen movie as a manual match', async () => {
    const file = await addFile('a.mkv', null);

    const result = await service.manualMatch({ fileId: file.id, tmdbId: 10 });

    expect(result.matchStatus).toBe(MatchStatus.Manual);
    expect(result.matchScore).toBeNull();
    expect(result.movie?.tmdbId).toBe(10);
  });

  it('removes the previously matched movie when it has no files left', async () => {
    const wrong = await movies.save({ tmdbId: 1, title: 'Wrong' });
    const file = await addFile('a.mkv', wrong);

    await service.manualMatch({ fileId: file.id, tmdbId: 2 });

    expect(await movies.findOneBy({ id: wrong.id })).toBeNull();
  });

  it('keeps the previous movie while other files still point at it', async () => {
    const shared = await movies.save({ tmdbId: 1, title: 'Shared' });
    const file = await addFile('a.mkv', shared);
    await addFile('b.mkv', shared);

    await service.manualMatch({ fileId: file.id, tmdbId: 2 });

    expect(await movies.findOneBy({ id: shared.id })).not.toBeNull();
  });

  it('keeps the movie when the file is matched to the same movie again', async () => {
    const movie = await movies.save({ tmdbId: 1, title: 'Same' });
    const file = await addFile('a.mkv', movie);

    await service.manualMatch({ fileId: file.id, tmdbId: 1 });

    expect(await movies.findOneBy({ id: movie.id })).not.toBeNull();
  });
});
