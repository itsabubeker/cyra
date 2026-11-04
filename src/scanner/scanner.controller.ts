import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ScannerService } from './scanner.service.js';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post()
  @HttpCode(200)
  async scan() {
    return await this.scannerService.scan();
  }
}
