import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
  ],
  controllers: [AppController],
})
export class AppModule {}
