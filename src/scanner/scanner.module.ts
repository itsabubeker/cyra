import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service.js';
import { ScannerController } from './scanner.controller.js';
import { MoviesModule } from '../movies/movies.module.js';

@Module({
  imports: [MoviesModule],
  providers: [ScannerService],
  controllers: [ScannerController],
})
export class ScannerModule {}
