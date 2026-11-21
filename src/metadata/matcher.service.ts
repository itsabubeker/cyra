import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MatchStatus,
  MediaFile,
} from '../movies/entities/media-file.entity.js';
import { Movie } from '../movies/entities/movie.entity.js';
import {
  FailedFileDto,
  MatchCandidateDto,
  UnmatchedFileDto,
} from './dto/metadata-response.dto.js';
import { Parsed, pickBest, scoreCandidate } from './title-matcher.js';
import { TmdbClient } from './tmdb.client.js';

const SCORE_THRESHOLD = 0.8;

@Injectable()
export class MatcherService {
  private readonly logger = new Logger(MatcherService.name);

  constructor(
    private readonly tmdbClient: TmdbClient,
    @InjectRepository(MediaFile)
    private readonly files: Repository<MediaFile>,
    @InjectRepository(Movie)
    private readonly movies: Repository<Movie>,
  ) {}

  async matchAll(onProgress?: (done: number, total: number) => void) {
    const mediaFiles = await this.files.find({
      where: { matchStatus: MatchStatus.Unmatched },
    });
    if (onProgress) {
      onProgress(0, mediaFiles.length);
    }

    let matched = 0;
    let processed = 0;
    const unmatched: UnmatchedFileDto[] = [];
    const failed: FailedFileDto[] = [];

    for (const file of mediaFiles) {
      try {
        const parsed: Parsed = {
          title: file.parsedTitle,
          year: file.parsedYear,
        };
        const searchResult = await this.tmdbClient.searchMovie({
          title: parsed.title,
          year: parsed.year ?? undefined,
        });
        const candidates = searchResult.items;

        if (candidates.length <= 0) {
          const cause = `No match for "${file.parsedTitle}" (${file.parsedYear})`;

          this.logger.warn(cause);
          unmatched.push({
            title: file.parsedTitle,
            relativePath: file.relativePath,
            cause,
          });
          continue;
        }

        const best = pickBest(parsed, candidates);

        if (!best || best.score < SCORE_THRESHOLD) {
          const cause = `No close match for "${file.parsedTitle}" (${file.parsedYear})`;

          this.logger.warn(cause);
          unmatched.push({
            title: file.parsedTitle,
            relativePath: file.relativePath,
            cause,
            candidates: candidates
              .map((c) =>
                Object.assign(new MatchCandidateDto(), c, {
                  score: scoreCandidate(parsed, c),
                }),
              )
              .sort((a, b) => b.score - a.score)
              .slice(0, 3),
          });
          continue;
        }

        let movie = await this.movies.findOneBy({ tmdbId: best.candidate.id });
        if (!movie) {
          const details = await this.tmdbClient.getMovie(best.candidate.id);
          if (!details)
            throw new Error(`TMDB movie ${best.candidate.id} not found`);
          const { id, originalTitle: _, ...fields } = details;
          movie = await this.movies.save({ tmdbId: id, ...fields });
        }

        file.movie = movie;
        file.matchStatus = MatchStatus.Matched;
        file.matchScore = best.score;
        await this.files.save(file);
        matched++;
      } catch (e) {
        if (e instanceof Error) {
          this.logger.error(
            `Matching file ${file.parsedTitle} failed Error:${e.message}`,
          );
          failed.push({
            title: file.parsedTitle,
            relativePath: file.relativePath,
            cause: `Matching file ${file.parsedTitle} failed Error:${e.message}`,
          });
        } else {
          this.logger.error(e);
          failed.push({
            title: file.parsedTitle,
            relativePath: file.relativePath,
            cause: 'Unknown error occured',
          });
        }
      } finally {
        processed += 1;
        if (onProgress) {
          onProgress(processed, mediaFiles.length);
        }
      }
    }

    return { total: mediaFiles.length, matched, unmatched, failed };
  }
}
