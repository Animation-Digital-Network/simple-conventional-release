import { describe, it, expect, vi } from 'vitest';
import { SimpleGit, simpleGit } from 'simple-git';
import { getValidTags } from '../../src/generate-release.service';

const mocks = vi.hoisted(() => {
  return {
    tags: vi.fn(),
  };
});

// Properly mock `simpleGit`
vi.mock('simple-git', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('simple-git')>()),
    simpleGit: (): Partial<SimpleGit> => ({
      tags: mocks.tags,
    }),
  };
});

describe('getValidTags', () => {
  const git = simpleGit();

  it('should return the last stable tag and previous stable tag when no RC versions are present', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0', 'v1.2.0'],
      latest: 'v1.2.0',
    });

    const result = await getValidTags(git);

    expect(result).toEqual({ fromTag: 'v1.1.0', toTag: 'v1.2.0' });
  });

  it('should return the last RC version and previous tag if the latest tag is an RC', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0-rc.1'],
      latest: 'v1.3.0-rc.1',
    });

    const result = await getValidTags(git);

    expect(result).toEqual({ fromTag: 'v1.2.0', toTag: 'v1.3.0-rc.1' });
  });

  it('should return the last two stable versions when multiple RC versions exist', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0', 'v1.2.0-rc.1', 'v1.2.0', 'v1.3.0-rc.1', 'v1.3.0'],
      latest: 'v1.3.0',
    });

    const result = await getValidTags(git);

    expect(result).toEqual({ fromTag: 'v1.2.0', toTag: 'v1.3.0' });
  });

  it('should return undefined when there are less than two valid tags', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0'],
      latest: 'v1.0.0',
    });

    const result = await getValidTags(git);

    expect(result).toEqual({ fromTag: undefined, toTag: 'v1.0.0' });
  });

  it('should throw an error when no valid tags are found', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: [], // No tags in the repository
      latest: undefined,
    });

    await expect(getValidTags(git)).rejects.toThrow('No valid tags found in the repository.');
  });

  it('should ignore invalid SemVer tags', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['invalid-tag', 'v1.0.0', 'v1.1.0'],
      latest: 'v1.1.0',
    });

    const result = await getValidTags(git);

    expect(result).toEqual({ fromTag: 'v1.0.0', toTag: 'v1.1.0' });
  });
});
