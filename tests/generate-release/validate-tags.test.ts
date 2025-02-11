import { describe, it, expect, vi, beforeEach } from 'vitest';
import { simpleGit, SimpleGit } from 'simple-git';
import { validateTags } from '../../src/generate-release.service';

// Define hoisted mocks
const mocks = vi.hoisted(() => ({
  tags: vi.fn(),
}));

// Properly mock `simpleGit`
vi.mock('simple-git', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('simple-git')>()),
    simpleGit: (): Partial<SimpleGit> => ({
      tags: mocks.tags,
    }),
  };
});

describe('validateTags', () => {
  const git = simpleGit();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true if both tags exist', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0', 'v1.2.0'],
    });

    const result = await validateTags(git, 'v1.0.0', 'v1.2.0');
    expect(result).toBe(true);
  });

  it('should return false if `tagFrom` does not exist', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.1.0', 'v1.2.0'],
    });

    const result = await validateTags(git, 'v1.0.0', 'v1.2.0');
    expect(result).toBe(false);
  });

  it('should return false if `tagTo` does not exist', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0'],
    });

    const result = await validateTags(git, 'v1.0.0', 'v1.2.0');
    expect(result).toBe(false);
  });

  it('should return false if neither tag exists', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v2.0.0', 'v2.1.0'],
    });

    const result = await validateTags(git, 'v1.0.0', 'v1.2.0');
    expect(result).toBe(false);
  });

  it('should return false if there are no tags in the repository', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: [],
    });

    const result = await validateTags(git, 'v1.0.0', 'v1.2.0');
    expect(result).toBe(false);
  });
});
