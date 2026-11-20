import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { FilesModule } from './files/files.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { MetaDataModule } from './metadata/metadata.module.js';
import { MoviesModule } from './movies/movies.module.js';
import { ScannerModule } from './scanner/scanner.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ScannerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DB_PATH', 'data/media.db'),
        autoLoadEntities: true,
        synchronize: true, // dev only, see note below
      }),
    }),
    MoviesModule,
    MetaDataModule,
    FilesModule,
    AuthModule,
    UsersModule,
    JobsModule,
    // Serves the built React client (web/dist). Everything outside /api and
    // /docs falls back to index.html so client-side routes survive a refresh.
    // The path resolves the same from src/ (tests) and dist/ (nest build).
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'web', 'dist'),
      exclude: ['/api/{*path}', '/docs/{*path}'],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
