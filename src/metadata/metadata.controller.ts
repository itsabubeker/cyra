import { Controller, HttpCode, Post } from '@nestjs/common';
import { MatcherService } from './matcher.service.js';

@Controller('matcher')
export class MetaDataController {
  constructor(private readonly matcherService: MatcherService) {}

  @Post('/matchall')
  @HttpCode(200)
  async matchAll() {
    return await this.matcherService.matchAll();
  }
}
