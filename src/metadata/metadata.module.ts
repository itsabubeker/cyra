import { Module } from '@nestjs/common';
import { MoviesModule } from '../movies/movies.module.js';
import { MatcherService } from './matcher.service.js';
import { MetaDataController } from './metadata.controller.js';
import { TmdbClient } from './tmdb.client.js';
import { JobsModule } from '../jobs/jobs.module.js';

@Module({
  imports: [MoviesModule, JobsModule],
  controllers: [MetaDataController],
  providers: [TmdbClient, MatcherService],
  exports: [TmdbClient],
})
export class MetaDataModule {}
