import { Controller, HttpCode, Post } from '@nestjs/common';
import { ScannerService } from './scanner.service.js';
import { ScannerResponseDto } from './dto/scanner-response.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.entity.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post()
  @HttpCode(200)
  @ApiBearerAuth()
  @Roles(Role.Admin)
  async scan(): Promise<ScannerResponseDto> {
    return await this.scannerService.scan();
  }
}
