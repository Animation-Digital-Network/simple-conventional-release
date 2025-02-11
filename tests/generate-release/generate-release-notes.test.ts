import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleGit } from 'simple-git';
import { generateReleaseNotes } from '../../src/generate-release.service';
import { GenerateConfiguration } from '../../src/types/generate-configuration.type';

// Define hoisted mocks
const mocks = vi.hoisted(() => ({
  tags: vi.fn(),
  log: vi.fn(),
  show: vi.fn(),
}));

// Properly mock `simpleGit`
vi.mock('simple-git', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('simple-git')>()),
    simpleGit: (): Partial<SimpleGit> => ({
      tags: mocks.tags,
      log: mocks.log,
      show: mocks.show,
    }),
  };
});

describe('generateReleaseNotes', () => {
  const baseConfig: GenerateConfiguration = { repositoryPath: '/path/to/repo' };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GITHUB_REPOSITORY = '';
    process.env.CI_PROJECT_URL = '';
  });

  it('should generate release notes with valid commits', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0'],
      latest: 'v1.1.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-10 00:00:00 +0000');

    vi.spyOn(mocks, 'log').mockResolvedValue({
      all: [
        { hash: 'abc1234', message: 'feat: Add new login feature', author_name: 'Alice', body: '' },
        { hash: 'def5678', message: 'fix(ui): Fix layout issue', author_name: 'Bob', body: '' },
      ],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain(`# 🚀 Release v1.1.0`);
    expect(result).toContain(`## 📅 Date: 2024-02-10`);
    expect(result).toContain(`- Add new login feature ([\`abc1234\`](#abc1234)) @Alice`);
    expect(result).toContain(`- **ui** Fix layout issue ([\`def5678\`](#def5678)) @Bob`);
    expect(result).toContain(`[v1.0.0...v1.1.0](#)`);
  });

  it('should return release notes with only one tag available', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0'],
      latest: 'v1.0.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-09 00:00:00 +0000');

    vi.spyOn(mocks, 'log').mockResolvedValue({
      all: [{ hash: 'abc5678', message: 'chore: Initial release', author_name: 'John', body: '' }],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain(`# 🚀 Release v1.0.0`);
    expect(result).toContain(`## 📅 Date: 2024-02-09`);
    expect(result).toContain(`- Initial release ([\`abc5678\`](#abc5678)) @John`);
    expect(result).toContain(`## 🔗 Full Changelog`);
  });

  it('should throw an error if no tags exist', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: [],
      latest: undefined,
    });

    await expect(generateReleaseNotes(baseConfig)).rejects.toThrow(
      'No valid tags found in the repository.',
    );
  });

  it('should throw an error if no commits exist between tags', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0'],
      latest: 'v1.1.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-10 00:00:00 +0000');
    vi.spyOn(mocks, 'log').mockResolvedValue({ all: [] });

    await expect(generateReleaseNotes(baseConfig)).rejects.toThrow(
      'No commits found between the specified tags {"from":"v1.0.0","to":"v1.1.0"} ',
    );
  });

  it('should correctly handle BREAKING CHANGE messages', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0'],
      latest: 'v1.1.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-10 00:00:00 +0000');

    vi.spyOn(mocks, 'log').mockResolvedValue({
      all: [
        {
          hash: 'ghi9012',
          message: 'feat: Refactor API',
          author_name: 'Charlie',
          body: 'BREAKING CHANGE: The API structure has been completely overhauled.',
        },
      ],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain('## 💥 BREAKING CHANGES');
    expect(result).toContain(
      '- The API structure has been completely overhauled. ([`ghi9012`](#ghi9012)) @Charlie',
    );
  });

  it('should properly format changelog links for GitHub repositories', async () => {
    process.env.GITHUB_REPOSITORY = 'owner/repo';

    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0'],
      latest: 'v1.1.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-10 00:00:00 +0000');

    vi.spyOn(mocks, 'log').mockResolvedValue({
      all: [{ hash: 'jkl3456', message: 'docs: Update README', author_name: 'Eve', body: '' }],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain(
      '[v1.0.0...v1.1.0](https://github.com/owner/repo/compare/v1.0.0...v1.1.0)',
    );
  });

  it('should properly format changelog links for GitLab repositories', async () => {
    process.env.CI_PROJECT_URL = 'https://gitlab.com/myproject';

    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0'],
      latest: 'v1.1.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-10 00:00:00 +0000');

    vi.spyOn(mocks, 'log').mockResolvedValue({
      all: [
        { hash: 'mno7890', message: 'ci: Improve pipeline speed', author_name: 'Frank', body: '' },
      ],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain(
      '[v1.0.0...v1.1.0](https://gitlab.com/myproject/-/compare/v1.0.0...v1.1.0)',
    );
  });

  it('should throw an error if manually provided tags do not exist', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0', 'v1.2.0'],
    });

    await expect(
      generateReleaseNotes({ ...baseConfig, tags: { from: 'v1.0.0', to: 'v1.99.0' } }),
    ).rejects.toThrow('Invalid tags provided or not enough valid tags to generate a release note.');
  });
});
