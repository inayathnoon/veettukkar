/**
 * Tests for WhatsApp notification helper — credential guard and sandbox/production routing.
 * Twilio is in functions/ deps not the app, so we test only the guard logic and exports.
 */

const mockCreate = jest.fn().mockResolvedValue({});

jest.mock('twilio', () => ({
  default: () => ({
    messages: { create: mockCreate },
  }),
}), { virtual: true });

import { sendWhatsApp, sendJobAlertWhatsApp, sendRatingReminderWhatsApp } from '../functions/src/notifications/whatsapp';

describe('WhatsApp helpers credential guard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sendWhatsApp skips silently when credentials not set', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await sendWhatsApp('+919876543210', 'Test message');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Twilio credentials not set'));
    expect(mockCreate).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('sendJobAlertWhatsApp skips silently when credentials not set', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await sendJobAlertWhatsApp('+919876543210', 'Plumber', '01 Apr', 'tdy3');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Twilio credentials not set'));
    expect(mockCreate).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('sendRatingReminderWhatsApp skips silently when credentials not set', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await sendRatingReminderWhatsApp('+919876543210', 'Painter');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Twilio credentials not set'));
    expect(mockCreate).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
