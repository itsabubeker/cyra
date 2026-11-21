import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { MediaFile } from './entities/media-file.entity.js';
import { Movie } from './entities/movie.entity.js';
import { WatchRecord } from './entities/watch-record.entity.js';
import { MoviesService } from './movies.service.js';

// Runs against a real in-memory SQLite database, because the queries under
// test (the files check, pagination, the watched join) live in SQL.
describe('MoviesService', () => {
  let module: TestingModule;
  let service: MoviesService;
  let movies: Repository<Movie>;
  let files: Repository<MediaFile>;
  let userId: number;
  let nextTmdbId = 0;

  const query = (overrides: { search?: string; year?: number } = {}) => ({
    page: 1,
    size: 20,
    ...overrides,
  });

  async function addMovie(
    title: string,
    { fileCount = 1, year = 2000 }: { fileCount?: number; year?: number } = {},
  ) {
    const movie = await movies.save({
      tmdbId: ++nextTmdbId,
      title,
      year,
      posterPath: null,
    });
    for (let i = 0; i < fileCount; i++) {
      await files.save({
        relativePath: `${title} (${year}) ${i}.mkv`,
        parsedTitle: title,
        parsedYear: year,
        sizeBytes: 0,
        movie,
      });
    }
    return movie;
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Movie, MediaFile, WatchRecord, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Movie, MediaFile, WatchRecord, User]),
      ],
      providers: [MoviesService],
    }).compile();

    service = module.get(MoviesService);
    movies = module.get(getRepositoryToken(Movie));
    files = module.get(getRepositoryToken(MediaFile));
    const users = module.get<Repository<User>>(getRepositoryToken(User));
    ({ id: userId } = await users.save({
      username: 'viewer',
      passwordHash: 'x',
    }));
  });

  afterEach(async () => {
    await module.close();
  });

  describe('findAll', () => {
    it('leaves out movies whose files are all gone', async () => {
      await addMovie('Heat');
      await addMovie('Gone', { fileCount: 0 });

      const result = await service.findAll({ query: query(), userId });

      expect(result.items.map((m) => m.title)).toEqual(['Heat']);
      expect(result.total).toBe(1);
    });

    it('lists a movie with several files once', async () => {
      await addMovie('Heat', { fileCount: 2 });

      const result = await service.findAll({ query: query(), userId });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by search text and year', async () => {
      await addMovie('Heat', { year: 1995 });
      await addMovie('Heat', { year: 1986 });
      await addMovie('Alien', { year: 1979 });

      const bySearch = await service.findAll({
        query: query({ search: 'hea' }),
        userId,
      });
      const byBoth = await service.findAll({
        query: query({ search: 'hea', year: 1995 }),
        userId,
      });

      expect(bySearch.total).toBe(2);
      expect(byBoth.items).toEqual([
        expect.objectContaining({ title: 'Heat', year: 1995 }),
      ]);
    });

    it('pages through the results in title order', async () => {
      for (const title of ['Casino', 'Alien', 'Brazil']) await addMovie(title);

      const page2 = await service.findAll({
        query: { page: 2, size: 2 },
        userId,
      });

      expect(page2.items.map((m) => m.title)).toEqual(['Casino']);
      expect(page2.total).toBe(3);
    });

    it('flags the movies the current user has watched', async () => {
      const heat = await addMovie('Heat');
      await addMovie('Alien');
      await service.markWatched({ movieId: heat.id, userId });

      const result = await service.findAll({ query: query(), userId });

      expect(
        Object.fromEntries(result.items.map((m) => [m.title, m.watched])),
      ).toEqual({ Alien: false, Heat: true });
    });
  });

  describe('findOne', () => {
    it('returns a movie with its files', async () => {
      const heat = await addMovie('Heat', { fileCount: 2 });

      const result = await service.findOne({ movieId: heat.id, userId });

      expect(result.files).toHaveLength(2);
    });

    it('treats a movie whose files are all gone as not found', async () => {
      const gone = await addMovie('Gone', { fileCount: 0 });

      await expect(
        service.findOne({ movieId: gone.id, userId }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
