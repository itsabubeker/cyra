import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { ListFilesQueryDto } from './dto/list-files-query.dto.js';
import { ManualMatchDto } from './dto/manual-match.dto.js';
import { FilesService } from './files.service.js';
import { StreamService } from './stream.service.js';
import type { Response } from 'express';
import { MediaFile } from '../movies/entities/media-file.entity.js';
import { PaginatedMediaFiles } from './dto/paginated-media-files.dto.js';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly streamService: StreamService,
  ) {}

  @Get()
  async findAll(
    @Query() query: ListFilesQueryDto,
  ): Promise<PaginatedMediaFiles> {
    const result = await this.filesService.findAll(query);

    return {
      items: result[0],
      page: query.page,
      limit: query.limit,
      total: result[1],
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MediaFile> {
    return this.filesService.findOne(id);
  }

  @Patch(':id/match')
  manualMatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ManualMatchDto,
  ) {
    return this.filesService.manualMatch({ fileId: id, tmdbId: body.tmdbId });
  }

  @Get(':id/stream')
  async stream(
    @Param('id', ParseIntPipe) id: number,
    @Headers('range') range: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.filesService.findOne(id);

    const streamData = await this.streamService.openFile(
      file.relativePath,
      range,
    );
    res.status(streamData.status);

    res.set(streamData.headers);
    return streamData.body;
  }
}
