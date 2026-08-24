import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status UP with Sokoza metadata', () => {
    const result = controller.checkHealth();
    expect(result.success).toBe(true);
    expect(result.service).toBe('SOKOZA');
    expect(result.status).toBe('UP');
    expect(result.location).toBe('Juja');
    expect(result.currency).toBe('KSh');
  });
});
