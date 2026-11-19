import {
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, type Stats } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { parseRange } from './parse-range.js';

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.webm': 'video/webm',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.ts': 'video/mp2t',
  '.flv': 'video/x-flv',
  '.mpg': 'video/mpeg',
  '.mpeg': 'video/mpeg',
};

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(private readonly configService: ConfigService) {}

  async resolveFile(relativePath: string) {
    const root = path.resolve(
      this.configService.getOrThrow<string>('MEDIA_DIR'),
    );
    const absolutePath = path.resolve(root, relativePath);

    if (!absolutePath.startsWith(root + path.sep)) {
      this.logger.warn(`Path escapes MEDIA_DIR: ${absolutePath}`);
      throw new NotFoundException('File not found');
    }

    let fileStat: Stats;
    try {
      fileStat = await stat(absolutePath);
    } catch (error) {
      this.logger.error(`Cannot stat ${absolutePath}`, error);
      throw new NotFoundException('File not found');
    }

    if (!fileStat.isFile()) {
      this.logger.warn(`Not a file: ${absolutePath}`);
      throw new NotFoundException('File not found');
    }

    const ext = path.extname(absolutePath).toLowerCase();

    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    return {
      absolutePath,
      sizeBytes: fileStat.size,
      contentType,
    };
  }
  async openFile(
    relativePath: string,
    rangeHeader: string | undefined,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    body?: StreamableFile;
  }> {
    const fileData = await this.resolveFile(relativePath);

    const rangeData = parseRange({
      header: rangeHeader,
      size: fileData.sizeBytes,
    });

    switch (rangeData.kind) {
      case 'full': {
        const stream = createReadStream(fileData.absolutePath);

        return {
          status: 200,
          headers: { 'Accept-Ranges': 'bytes' },
          body: new StreamableFile(stream, {
            type: fileData.contentType,
            length: fileData.sizeBytes,
          }),
        };
      }

      case 'partial': {
        const partialStream = createReadStream(fileData.absolutePath, {
          start: rangeData.start,
          end: rangeData.end,
        });
        const { start, end } = rangeData;
        const length = end - start + 1;

        return {
          status: 206,
          headers: {
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${start}-${end}/${fileData.sizeBytes}`,
          },

          body: new StreamableFile(partialStream, {
            type: fileData.contentType,
            length,
          }),
        };
      }
      case 'unsatisfiable': {
        return {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileData.sizeBytes}` },
        };
      }
    }
  }
}
