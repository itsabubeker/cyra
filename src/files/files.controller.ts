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
import { PaginatedMediaFilesDto } from './dto/files-response.dto.js';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly streamService: StreamService,
  ) {}

  @Get()
  async findAll(
    @Query() query: ListFilesQueryDto,
  ): Promise<PaginatedMediaFilesDto> {
    const result = await this.filesService.findAll(query);

    return {
      items: result[0],
      page: query.page,
      size: query.size,
      total: result[1],
    };
  }

  @Get(':id')
  @ApiNotFoundResponse({
    description: 'File record not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MediaFile> {
    return this.filesService.findOne(id);
  }

  @Patch(':id/match')
  @ApiNotFoundResponse({
    description: 'No file, or TMDB has no movie with that tmdbId',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse()
  @ApiBadGatewayResponse({ type: ErrorResponseDto })
  manualMatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ManualMatchDto,
  ): Promise<MediaFile> {
    return this.filesService.manualMatch({ fileId: id, tmdbId: body.tmdbId });
  }

  @Get(':id/stream')
  @ApiHeader({
    name: 'Range',
    required: false,
    description: 'Byte range, e.g. bytes=0-99',
  })
  @ApiProduces('video/mp4', 'video/x-matroska', 'video/webm', 'video/x-msvideo')
  @ApiOkResponse({ description: 'Whole file (no Range header)' })
  @ApiResponse({
    status: 206,
    description: 'Partial content: the requested byte range',
  })
  @ApiResponse({ status: 416, description: 'Range not satisfiable' })
  @ApiNotFoundResponse({
    description: 'File record not found, or the file is missing on disk',
    type: ErrorResponseDto,
  })
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
