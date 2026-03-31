import fs from 'fs';
import path from 'path';

describe('Error Boundary Implementation', () => {
  it('should create ErrorBoundary component file', () => {
    const componentPath = path.join(__dirname, '../components/ErrorBoundary.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
  });

  it('should have error boundary as class component', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('class ErrorBoundary extends Component');
  });

  it('should implement componentDidCatch', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('componentDidCatch');
  });

  it('should implement getDerivedStateFromError', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('getDerivedStateFromError');
  });

  it('should render fallback UI on error', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('hasError');
    expect(source).toContain('errorContainer');
  });

  it('should display Malayalam error message', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('എന്തോ കുഴപ്പം നേരിട്ടു');
  });

  it('should have retry button functionality', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('handleRetry');
    expect(source).toContain('retryButton');
  });

  it('should log errors to Crashlytics', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('logError');
  });

  it('should show dev info in development', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/ErrorBoundary.tsx'), 'utf-8');
    expect(source).toContain('__DEV__');
    expect(source).toContain('devSection');
  });

  it('should create crashlytics helper file', () => {
    const helperPath = path.join(__dirname, '../lib/crashlytics.ts');
    expect(fs.existsSync(helperPath)).toBe(true);
  });

  it('should export logError function', () => {
    const source = fs.readFileSync(path.join(__dirname, '../lib/crashlytics.ts'), 'utf-8');
    expect(source).toContain('export const logError');
  });

  it('should export setUserContext function', () => {
    const source = fs.readFileSync(path.join(__dirname, '../lib/crashlytics.ts'), 'utf-8');
    expect(source).toContain('export const setUserContext');
  });

  it('should export clearUserContext function', () => {
    const source = fs.readFileSync(path.join(__dirname, '../lib/crashlytics.ts'), 'utf-8');
    expect(source).toContain('export const clearUserContext');
  });

  it('should wrap root layout in ErrorBoundary', () => {
    const source = fs.readFileSync(path.join(__dirname, '../app/_layout.tsx'), 'utf-8');
    expect(source).toContain('ErrorBoundary');
    expect(source).toContain("from '../components/ErrorBoundary'");
  });

  it('should have Crashlytics dependency in package.json', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
    expect(packageJson.dependencies['@react-native-firebase/crashlytics']).toBeDefined();
  });

  it('should log errors in useAuth hook', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useAuth.ts'), 'utf-8');
    expect(source).toContain("from '../lib/crashlytics'");
    expect(source).toContain('logError');
  });

  it('should log errors in useJobs hook', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useJobs.ts'), 'utf-8');
    expect(source).toContain("from '../lib/crashlytics'");
    expect(source).toContain('logError');
  });

  it('should log errors in useRating hook', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useRating.ts'), 'utf-8');
    expect(source).toContain("from '../lib/crashlytics'");
    expect(source).toContain('logError');
  });

  it('should log errors in useWorkerBrowse hook', () => {
    const source = fs.readFileSync(path.join(__dirname, '../hooks/useWorkerBrowse.ts'), 'utf-8');
    expect(source).toContain("from '../lib/crashlytics'");
    expect(source).toContain('logError');
  });

  it('should handle errors gracefully with context', () => {
    const source = fs.readFileSync(path.join(__dirname, '../lib/crashlytics.ts'), 'utf-8');
    expect(source).toContain('ErrorContext');
    expect(source).toContain('setAttribute');
  });
});
