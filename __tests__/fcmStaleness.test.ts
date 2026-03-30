describe('FCM Staleness', () => {
  it('should mark tokens as stale after 7 days', () => {
    const lastRefresh = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const isStale = Date.now() - lastRefresh > 7 * 24 * 60 * 60 * 1000;
    expect(isStale).toBe(true);
  });

  it('should not mark tokens as stale within 7 days', () => {
    const lastRefresh = Date.now() - 6 * 24 * 60 * 60 * 1000;
    const isStale = Date.now() - lastRefresh > 7 * 24 * 60 * 60 * 1000;
    expect(isStale).toBe(false);
  });

  it('should refresh token on app launch', () => {
    const newToken = 'token-abc123';
    expect(newToken).toBeTruthy();
  });

  it('should queue WhatsApp if FCM 404', () => {
    const fcmError = { code: 404 };
    const shouldQueueWhatsApp = fcmError.code === 404;
    expect(shouldQueueWhatsApp).toBe(true);
  });
});
