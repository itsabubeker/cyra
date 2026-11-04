import { Test } from '@nestjs/testing';
import { ScannerController } from './scanner.controller.js';
import { ScannerService } from './scanner.service.js';

describe('ScannerController', () => {
  let controller: ScannerController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ScannerController],
      providers: [{ provide: ScannerService, useValue: { scan: vi.fn() } }],
    }).compile();

    controller = moduleRef.get(ScannerController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });
});
