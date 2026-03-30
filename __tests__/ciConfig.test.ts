import fs from 'fs';
import path from 'path';

describe('CI/CD Configuration', () => {
  it('should have test.yml workflow file', () => {
    const testWorkflowPath = path.join(__dirname, '../.github/workflows/test.yml');
    expect(fs.existsSync(testWorkflowPath)).toBe(true);
  });

  it('should have deploy-functions.yml workflow file', () => {
    const deployWorkflowPath = path.join(__dirname, '../.github/workflows/deploy-functions.yml');
    expect(fs.existsSync(deployWorkflowPath)).toBe(true);
  });

  it('test.yml should have valid structure', () => {
    const testWorkflowPath = path.join(__dirname, '../.github/workflows/test.yml');
    const content = fs.readFileSync(testWorkflowPath, 'utf-8');

    expect(content).toContain('name: Test');
    expect(content).toContain('on:');
    expect(content).toContain('jobs:');
    expect(content).toContain('test:');
  });

  it('test.yml should trigger on push and pull_request to main and develop', () => {
    const testWorkflowPath = path.join(__dirname, '../.github/workflows/test.yml');
    const content = fs.readFileSync(testWorkflowPath, 'utf-8');

    expect(content).toContain('branches: [main, develop]');
    expect(content).toContain('on:');
    expect(content).toContain('push:');
    expect(content).toContain('pull_request:');
  });

  it('test.yml should run npm run test:ci command', () => {
    const testWorkflowPath = path.join(__dirname, '../.github/workflows/test.yml');
    const content = fs.readFileSync(testWorkflowPath, 'utf-8');

    expect(content).toContain('npm run test:ci');
  });

  it('test.yml should upload coverage to codecov', () => {
    const testWorkflowPath = path.join(__dirname, '../.github/workflows/test.yml');
    const content = fs.readFileSync(testWorkflowPath, 'utf-8');

    expect(content).toContain('codecov/codecov-action');
    expect(content).toContain('Upload coverage reports');
  });

  it('deploy-functions.yml should have valid structure', () => {
    const deployWorkflowPath = path.join(__dirname, '../.github/workflows/deploy-functions.yml');
    const content = fs.readFileSync(deployWorkflowPath, 'utf-8');

    expect(content).toContain('name: Deploy Functions');
    expect(content).toContain('on:');
    expect(content).toContain('jobs:');
    expect(content).toContain('deploy:');
  });

  it('deploy-functions.yml should only trigger on push to main', () => {
    const deployWorkflowPath = path.join(__dirname, '../.github/workflows/deploy-functions.yml');
    const content = fs.readFileSync(deployWorkflowPath, 'utf-8');

    expect(content).toContain('branches: [main]');
    expect(content).toContain('functions/**');
    expect(content).toContain("- '.github/workflows/deploy-functions.yml'");
  });

  it('deploy-functions.yml should use Firebase action and FIREBASE_TOKEN', () => {
    const deployWorkflowPath = path.join(__dirname, '../.github/workflows/deploy-functions.yml');
    const content = fs.readFileSync(deployWorkflowPath, 'utf-8');

    expect(content).toContain('w9jds/firebase-action');
    expect(content).toContain('FIREBASE_TOKEN');
    expect(content).toContain('Deploy to Firebase');
    expect(content).toContain('secrets.FIREBASE_TOKEN');
  });

  it('package.json should have test:ci script', () => {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts['test:ci']).toBeDefined();
    expect(packageJson.scripts['test:ci']).toContain('jest');
    expect(packageJson.scripts['test:ci']).toContain('--coverage');
    expect(packageJson.scripts['test:ci']).toContain('--ci');
  });
});
