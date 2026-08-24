import { Controller, Get } from '@nestjs/common';
import { APP_CONFIG } from '@sokoza/config';

@Controller('health')
export class HealthController {
  @Get()
  checkHealth() {
    return {
      success: true,
      service: APP_CONFIG.name,
      tagline: APP_CONFIG.tagline,
      status: 'UP',
      timestamp: new Date().toISOString(),
      location: APP_CONFIG.initialLocation.name,
      country: APP_CONFIG.country,
      currency: APP_CONFIG.currency,
      version: '1.0.0',
    };
  }
}
