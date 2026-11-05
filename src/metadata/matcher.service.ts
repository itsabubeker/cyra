import { Injectable, Logger } from '@nestjs/common';
import { TmdbClient } from './tmdb.client.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MatchStatus,
  MediaFile,
} from '../movies/entities/media-file.entity.js';
import { Movie } from '../movies/entities/movie.entity.js';
import {
  Candidate,
  Parsed,
  pickBest,
  scoreCandidate,
} from './title-matcher.js';

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

  async matchAll() {
    const mediaFiles = await this.files.find({
      where: { matchStatus: MatchStatus.Unmatched },
    });

    let matched = 0;
    const unmatched: {
      title: string;
      relativePath: string;
      cause: string;
      candidates?: Candidate[];
    }[] = [];
    const failed: {
      title: string;
      relativePath: string;
      cause: string;
    }[] = [];

    for (const file of mediaFiles) {
      try {
        const parsed: Parsed = {
          title: file.parsedTitle,
          year: file.parsedYear,
        };
        const candidates = await this.tmdbClient.searchMovie(
          parsed.title,
          parsed.year,
        );

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
              .map((c) => ({ ...c, score: scoreCandidate(parsed, c) }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 3),
          });
          continue;
        }

        let movie = await this.movies.findOneBy({ tmdbId: best.candidate.id });
        if (!movie) {
          movie = await this.movies.save({
            tmdbId: best.candidate.id,
            title: best.candidate.title,
            year: best.candidate.year,
            posterPath: best.candidate.posterPath,
          });
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
      }
    }

    return { total: mediaFiles.length, matched, unmatched, failed };
  }
}
