import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator.js';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get('health')
  getHealth() {
    return { status: 'Ok' };
  }
}
