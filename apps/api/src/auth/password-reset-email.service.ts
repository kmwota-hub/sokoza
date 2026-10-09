import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class PasswordResetEmailService {
  assertConfigured(): void {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      throw new ServiceUnavailableException(
        'Password recovery email is not configured. Set RESEND_API_KEY and EMAIL_FROM.',
      );
    }
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetUrl: string): Promise<void> {
    this.assertConfigured();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Reset your SOKOZA password',
        html: `<p>Hello ${escapeHtml(firstName)},</p><p>We received a request to reset your SOKOZA password. This link expires in one hour.</p><p><a href="${escapeHtml(resetUrl)}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
        text: `Hello ${firstName},\n\nWe received a request to reset your SOKOZA password. This link expires in one hour.\n\nReset your password: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Password recovery email could not be sent (Resend returned ${response.status}).`,
      );
    }
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
