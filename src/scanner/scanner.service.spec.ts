import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScannerService } from './scanner.service.js';
import { MediaFile } from '../movies/entities/media-file.entity.js';

describe('ScannerService', () => {
  let service: ScannerService;
  let tempDir: string;
  let files: {
    find: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'scanner-test-'));

    files = {
      find: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
      upsert: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScannerService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: vi.fn().mockReturnValue(tempDir) },
        },
        { provide: getRepositoryToken(MediaFile), useValue: files },
      ],
    }).compile();

    service = module.get<ScannerService>(ScannerService);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('upserts a row for each video file', async () => {
    await writeFile(path.join(tempDir, 'Heat (1995).mkv'), '');

    await service.scan();

    expect(files.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          relativePath: 'Heat (1995).mkv',
          parsedTitle: 'Heat',
          parsedYear: 1995,
        }),
      ],
      ['relativePath'],
    );
  });
  it('ignores video files inside extras folders', async () => {
    await writeFile(path.join(tempDir, 'Heat (1995).mkv'), '');
    await mkdir(path.join(tempDir, 'Extras'));
    await writeFile(path.join(tempDir, 'Extras', 'Making Of (1995).mkv'), '');

    await service.scan();

    expect(files.upsert).toHaveBeenCalledWith(
      [expect.objectContaining({ relativePath: 'Heat (1995).mkv' })],
      ['relativePath'],
    );
  });

  it('deletes rows whose file no longer exists', async () => {
    await writeFile(path.join(tempDir, 'Heat (1995).mkv'), '');
    files.find.mockResolvedValue([
      { id: 1, relativePath: 'Heat (1995).mkv' },
      { id: 7, relativePath: 'Gone (2000).mkv' },
    ]);

    await service.scan();

    expect(files.delete).toHaveBeenCalledWith([7]);
  });

  it('never deletes anything when the scan finds no files', async () => {
    files.find.mockResolvedValue([{ id: 7, relativePath: 'Gone (2000).mkv' }]);

    await service.scan();

    expect(files.delete).not.toHaveBeenCalled();
  });
});
