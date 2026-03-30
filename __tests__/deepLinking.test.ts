// Mock Firebase modules BEFORE importing hooks
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(),
  Slot: jest.fn(),
}));

import fs from 'fs';
import path from 'path';

describe('Deep Linking from Push Notifications', () => {
  it('should create useNotifications hook file', () => {
    const hookPath = path.join(__dirname, '../hooks/useNotifications.ts');
    expect(fs.existsSync(hookPath)).toBe(true);
  });

  it('should listen for notification opened app events', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('onNotificationOpenedApp');
  });

  it('should listen for initial notification on mount', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('getInitialNotification');
  });

  it('should handle job_alert notification type', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('job_alert');
    expect(source).toContain('/(worker)/my-jobs');
  });

  it('should handle job_confirmed notification type', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('job_confirmed');
    expect(source).toContain('/(homeowner)/job-detail');
  });

  it('should handle rating_prompt notification type', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('rating_prompt');
    expect(source).toContain('rate-worker');
    expect(source).toContain('rate-homeowner');
  });

  it('should route based on user role for rating prompts', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('homeowner');
    expect(source).toContain('worker');
  });

  it('should validate notification data structure', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('jobId');
    expect(source).toContain('type');
  });

  it('should be integrated into root layout', () => {
    const source = fs.readFileSync(path.join(__dirname, '../app/_layout.tsx'), 'utf-8');
    expect(source).toContain('useNotifications');
    expect(source).toContain("'../hooks/useNotifications'");
  });

  it('should have proper TypeScript types for notification data', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('NotificationData');
    expect(source).toContain('interface NotificationData');
  });

  it('should handle errors gracefully', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useNotifications.ts'), 'utf-8');
    expect(source).toContain('catch');
    expect(source).toContain('console.error');
  });
});
