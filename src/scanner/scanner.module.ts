import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module.js';
import { MoviesModule } from '../movies/movies.module.js';
import { ScannerController } from './scanner.controller.js';
import { ScannerService } from './scanner.service.js';

@Module({
  imports: [MoviesModule, JobsModule],
  providers: [ScannerService],
  controllers: [ScannerController],
})
export class ScannerModule {}
