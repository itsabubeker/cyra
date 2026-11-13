import { Controller, HttpCode, Post } from '@nestjs/common';
import { ScannerService } from './scanner.service.js';
import { ScannerResponseDto } from './dto/scanner-response.dto.js';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post()
  @HttpCode(200)
  async scan(): Promise<ScannerResponseDto> {
    return await this.scannerService.scan();
  }
}
