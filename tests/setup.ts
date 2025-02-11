import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  vi.stubEnv('GITHUB_REPOSITORY', undefined);
  vi.stubEnv('CI_PROJECT_URL', undefined);
});
