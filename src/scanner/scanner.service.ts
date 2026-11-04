import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseFilename } from './filenameParser.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaFile } from '../movies/entities/media-file.entity.js';
import { Repository } from 'typeorm';
import { VIDEO_EXTS as VIDEO_EXTENSIONS } from './video-extensions.js';

const VIDEO_EXTS = new Set<string>(VIDEO_EXTENSIONS);

type ScanRow = Pick<
  MediaFile,
  'relativePath' | 'parsedTitle' | 'parsedYear' | 'sizeBytes'
>;

const EXTRAS_DIRS = new Set([
  'featurettes',
  'extras',
  'samples',
  'sample',
  'trailers',
  'behind the scenes',
  'deleted scenes',
  'interviews',
  'bonus',
]);

export interface VideoFile {
  name: string;
  path: string;
  size: number;
}

const scanDir = async (dir: string): Promise<VideoFile[]> => {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });

  const isVideo = (name: string) =>
    VIDEO_EXTS.has(path.extname(name).slice(1).toLowerCase());

  const videos = entries.filter((e) => {
    const inExtras = path
      .relative(dir, e.parentPath)
      .toLowerCase()
      .split(path.sep)
      .some((segment) => EXTRAS_DIRS.has(segment));

    return e.isFile() && isVideo(e.name) && !inExtras;
  });

  return Promise.all(
    videos.map(async (e) => {
      const fullPath = path.join(e.parentPath, e.name);
      const { size } = await stat(fullPath);
      return { name: e.name, path: fullPath, size };
    }),
  );
};

@Injectable()
export class ScannerService {
  private readonly logger = new Logger(ScannerService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MediaFile)
    private readonly files: Repository<MediaFile>,
  ) {}

  private async removeStale(rows: ScanRow[]): Promise<number> {
    if (rows.length === 0) return 0; // safety: never wipe the table on an empty scan

    const seen = new Set(rows.map((r) => r.relativePath));
    const existing = await this.files.find({
      select: { id: true, relativePath: true },
    });
    const staleIds = existing
      .filter((e) => !seen.has(e.relativePath))
      .map((e) => e.id);

    if (staleIds.length > 0) await this.files.delete(staleIds);
    return staleIds.length;
  }

  async scan() {
    const mediaDir = this.configService.getOrThrow<string>('MEDIA_DIR');

    const videos = await scanDir(mediaDir);

    const rows = videos.map((video) => {
      const fromFile = parseFilename(video.name);
      const fromFolder = parseFilename(path.basename(path.dirname(video.path)));

      const parsed =
        fromFile.year === null && fromFolder.year !== null
          ? fromFolder
          : fromFile;

      return {
        relativePath: path.relative(mediaDir, video.path),
        parsedTitle: parsed.title,
        parsedYear: parsed.year,
        sizeBytes: video.size,
      };
    });

    for (let i = 0; i < rows.length; i += 200) {
      const batch = rows.slice(i, i + 200).map((r) => ({ ...r }));
      await this.files.upsert(batch, ['relativePath']);
    }

    const removed = await this.removeStale(rows);

    this.logger.log(
      `Scanned ${rows.length} video files in ${mediaDir}, removed ${removed} stale`,
    );

    const items = await this.files.find({ order: { relativePath: 'ASC' } });
    return { count: items.length, items };
  }
}
