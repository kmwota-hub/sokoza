import { APP_CONFIG } from '@sokoza/config';
import { RegisterUserSchema } from '@sokoza/validation';

describe('Phase 1 Integration & Type Sanity Checks', () => {
  it('should import APP_CONFIG with Juja Kenya settings', () => {
    expect(APP_CONFIG.name).toBe('SOKOZA');
    expect(APP_CONFIG.initialLocation.name).toBe('Juja');
    expect(APP_CONFIG.currency).toBe('KSh');
  });

  it('should validate user input using @sokoza/validation Zod schema', () => {
    const validData = {
      firstName: 'Wanjiru',
      lastName: 'Kamenju',
      email: 'wanjiru@example.co.ke',
      phone: '+254712345678',
      password: 'SecurePassword123!',
      role: 'CUSTOMER',
    };

    const result = RegisterUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
