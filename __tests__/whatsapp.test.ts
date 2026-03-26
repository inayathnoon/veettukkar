/**
 * Tests for WhatsApp notification helper.
 * Verifies credential guard, sandbox mode fallback, and template routing.
 */

describe('sendWhatsApp credential guard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('skips silently when Twilio credentials are not set', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('../functions/src/notifications/whatsapp');
    await mod.sendWhatsApp('+919876543210', 'Test message');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Twilio credentials not set'));
    warnSpy.mockRestore();
  });

  it('skips job alert silently when credentials not set', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('../functions/src/notifications/whatsapp');
    await mod.sendJobAlertWhatsApp('+919876543210', 'Plumber', '01 Apr', 'tdy3');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Twilio credentials not set'));
    warnSpy.mockRestore();
  });

  it('skips rating reminder silently when credentials not set', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('../functions/src/notifications/whatsapp');
    await mod.sendRatingReminderWhatsApp('+919876543210', 'Painter');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Twilio credentials not set'));
    warnSpy.mockRestore();
  });
});

describe('sendJobAlertWhatsApp sandbox vs production routing', () => {
  const mockCreate = jest.fn().mockResolvedValue({});
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      TWILIO_ACCOUNT_SID: 'ACtest',
      TWILIO_AUTH_TOKEN: 'authtest',
      TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886',
    };

    jest.mock('twilio', () => ({
      default: () => ({
        messages: { create: mockCreate },
      }),
    }));
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('sends freeform message in sandbox mode', async () => {
    process.env.TWILIO_SANDBOX_MODE = 'true';
    const mod = await import('../functions/src/notifications/whatsapp');
    await mod.sendJobAlertWhatsApp('+919876543210', 'Plumber', '01 Apr', 'tdy3');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.stringContaining('Plumber') })
    );
    expect(mockCreate).not.toHaveBeenCalledWith(
      expect.objectContaining({ contentSid: expect.anything() })
    );
  });

  it('sends template message in production mode', async () => {
    process.env.TWILIO_SANDBOX_MODE = 'false';
    process.env.TWILIO_TEMPLATE_JOB_ALERT = 'HXtesttemplateid';
    const mod = await import('../functions/src/notifications/whatsapp');
    await mod.sendJobAlertWhatsApp('+919876543210', 'Plumber', '01 Apr', 'tdy3');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ contentSid: 'HXtesttemplateid' })
    );
  });
});
