import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaFile } from '../movies/entities/media-file.entity.js';
import { Movie } from '../movies/entities/movie.entity.js';
import { MatcherService } from './matcher.service.js';
import { MetaDataController } from './metadata.controller.js';
import { TmdbClient } from './tmdb.client.js';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MediaFile])],
  controllers: [MetaDataController],
  providers: [TmdbClient, MatcherService],
  exports: [TmdbClient],
})
export class MetaDataModule {}
