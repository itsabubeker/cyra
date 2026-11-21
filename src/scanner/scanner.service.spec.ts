import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScannerService } from './scanner.service.js';
import {
  MatchStatus,
  MediaFile,
} from '../movies/entities/media-file.entity.js';
import { Movie } from '../movies/entities/movie.entity.js';
import { WatchRecord } from '../movies/entities/watch-record.entity.js';
import { User } from '../users/entities/user.entity.js';

// Runs against a real SQLite database: the upsert behaviour under test
// depends on the driver, which a mocked repository can't reproduce.
describe('ScannerService', () => {
  let module: TestingModule;
  let service: ScannerService;
  let files: Repository<MediaFile>;
  let mediaDir: string;
  let dbDir: string;

  /** Boots a fresh app connection, like a server start, on the same database file. */
  async function start() {
    await module?.close();
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: path.join(dbDir, 'test.db'),
          entities: [MediaFile, Movie, WatchRecord, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([MediaFile]),
      ],
      providers: [
        ScannerService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: vi.fn().mockReturnValue(mediaDir) },
        },
      ],
    }).compile();

    service = module.get(ScannerService);
    files = module.get(getRepositoryToken(MediaFile));
  }

  beforeEach(async () => {
    mediaDir = await mkdtemp(path.join(os.tmpdir(), 'scanner-media-'));
    dbDir = await mkdtemp(path.join(os.tmpdir(), 'scanner-db-'));
    await start();
  });

  afterEach(async () => {
    await module.close();
    await rm(mediaDir, { recursive: true, force: true });
    await rm(dbDir, { recursive: true, force: true });
  });

  it('adds a row for each video file', async () => {
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), '');

    await service.scan();

    expect(await files.find()).toEqual([
      expect.objectContaining({
        relativePath: 'Heat (1995).mkv',
        parsedTitle: 'Heat',
        parsedYear: 1995,
        matchStatus: MatchStatus.Unmatched,
      }),
    ]);
  });

  it('can scan again after a restart when every file is already in the library', async () => {
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), '');
    await writeFile(path.join(mediaDir, 'Alien (1979).mp4'), '');
    await service.scan();
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), 'grown');
    await start();

    const result = await service.scan();

    expect(result).toEqual({
      scannedVideoItemsCount: 2,
      currentItemsCount: 2,
      removedStaleCount: 0,
    });
    const heat = await files.findOneByOrFail({
      relativePath: 'Heat (1995).mkv',
    });
    expect(heat.sizeBytes).toBe(5);
  });

  it('adds new files on a later scan', async () => {
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), '');
    await service.scan();
    await writeFile(path.join(mediaDir, 'Alien (1979).mp4'), '');

    const result = await service.scan();

    expect(result.currentItemsCount).toBe(2);
  });

  it('keeps match data when a known file is scanned again', async () => {
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), '');
    await service.scan();
    const heat = await files.findOneByOrFail({
      relativePath: 'Heat (1995).mkv',
    });
    await files.update(heat.id, {
      matchStatus: MatchStatus.Manual,
      matchScore: null,
    });

    await service.scan();

    const rescanned = await files.findOneByOrFail({ id: heat.id });
    expect(rescanned.matchStatus).toBe(MatchStatus.Manual);
  });

  it('ignores video files inside extras folders', async () => {
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), '');
    await mkdir(path.join(mediaDir, 'Extras'));
    await writeFile(path.join(mediaDir, 'Extras', 'Making Of (1995).mkv'), '');

    await service.scan();

    const paths = (await files.find()).map((file) => file.relativePath);
    expect(paths).toEqual(['Heat (1995).mkv']);
  });

  it('deletes rows whose file no longer exists', async () => {
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), '');
    await writeFile(path.join(mediaDir, 'Gone (2000).mkv'), '');
    await service.scan();
    await rm(path.join(mediaDir, 'Gone (2000).mkv'));

    const result = await service.scan();

    expect(result.removedStaleCount).toBe(1);
    const paths = (await files.find()).map((file) => file.relativePath);
    expect(paths).toEqual(['Heat (1995).mkv']);
  });

  it('keeps the movie when its last file is removed, so a replacement file matches back to it', async () => {
    await writeFile(path.join(mediaDir, 'Heat (1995).mkv'), '');
    await writeFile(path.join(mediaDir, 'Alien (1979).mp4'), '');
    await service.scan();
    const movie = await files.manager.save(Movie, {
      tmdbId: 949,
      title: 'Heat',
      year: 1995,
      posterPath: null,
    });
    await files.update({ relativePath: 'Heat (1995).mkv' }, { movie });
    await rm(path.join(mediaDir, 'Heat (1995).mkv'));

    await service.scan();

    expect(await files.countBy({ movie: { id: movie.id } })).toBe(0);
    expect(await files.manager.existsBy(Movie, { id: movie.id })).toBe(true);
  });

  it('never deletes anything when the scan finds no files', async () => {
    await files.save({
      relativePath: 'Gone (2000).mkv',
      parsedTitle: 'Gone',
      parsedYear: 2000,
      sizeBytes: 0,
    });

    await service.scan();

    expect(await files.count()).toBe(1);
  });
});
