import { Module } from '@nestjs/common';
import { MoviesModule } from '../movies/movies.module.js';
import { TmdbClient } from './tmdb.client.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaFile } from '../movies/entities/media-file.entity.js';
import { Movie } from '../movies/entities/movie.entity.js';
import { MetaDataController } from './metadata.controller.js';
import { MatcherService } from './matcher.service.js';

@Module({
  imports: [MoviesModule, TypeOrmModule.forFeature([Movie, MediaFile])],
  controllers: [MetaDataController],
  providers: [TmdbClient, MatcherService],
  exports: [TmdbClient],
})
export class MetaDataModule {}
