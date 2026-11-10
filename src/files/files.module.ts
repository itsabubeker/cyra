import { Module } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { FilesController } from './files.controller.js';
import { MoviesModule } from '../movies/movies.module.js';
import { MetaDataModule } from '../metadata/metadata.module.js';
import { StreamService } from './stream.service.js';

@Module({
  imports: [MoviesModule, MetaDataModule],
  controllers: [FilesController],
  providers: [FilesService, StreamService],
})
export class FilesModule {}
