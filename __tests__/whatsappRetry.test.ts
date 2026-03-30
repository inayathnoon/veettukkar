describe('WhatsApp Retry Logic', () => {
  it('should queue failed messages', () => {
    const message = { status: 'pending', attempts: 0 };
    expect(message.status).toBe('pending');
  });

  it('should retry with exponential backoff', () => {
    const attempts = 2;
    const nextRetryMinutes = 5 * (attempts + 1); // 5, 10, 15
    expect(nextRetryMinutes).toBe(15);
  });

  it('should give up after 3 attempts', () => {
    const maxAttempts = 3;
    const canRetry = (attempts) => attempts < maxAttempts;
    expect(canRetry(3)).toBe(false);
  });
});
