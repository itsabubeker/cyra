import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { MoviesController } from './movies.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity.js';
import { MediaFile } from './entities/media-file.entity.js';
import { WatchRecord } from './entities/watch-record.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MediaFile, WatchRecord])],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [TypeOrmModule],
})
export class MoviesModule {}
