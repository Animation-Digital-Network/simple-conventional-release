import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleGit } from 'simple-git';
import { generateReleaseNotes } from '../../src/generate-release.service';
import { GenerateConfiguration } from '../../src/types/generate-configuration.type';
import { createCommit } from '../helpers/create-commit.helper';

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
        createCommit(
          'feat: Add new login feature',
          'Alice',
          'alice@test.com',
          '',
          'abc1234tnhfkienfgdfgdf5445cg',
        ),
        createCommit(
          'fix(ui): Fix layout issue',
          'Bob',
          'bob@test.com',
          '',
          'def5678tnhfkienfgdfgdf5445cg',
        ),
      ],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain(`# Release v1.1.0 (2024-02-10)`);
    expect(result).toContain(
      `- Add new login feature ([\`abc1234\`](#abc1234tnhfkienfgdfgdf5445cg)) [@Alice](#alice@test.com)`,
    );
    expect(result).toContain(
      `- **ui** Fix layout issue ([\`def5678\`](#def5678tnhfkienfgdfgdf5445cg)) [@Bob](#bob@test.com)`,
    );
    expect(result).toContain(`[v1.0.0...v1.1.0](#)`);
  });

  it('should return release notes with only one tag available', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0'],
      latest: 'v1.0.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-09 00:00:00 +0000');

    vi.spyOn(mocks, 'log').mockResolvedValue({
      all: [
        createCommit('chore: Initial release', 'John', 'john@test.com', '', 'abc5678sdgsd441165cg'),
      ],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain(`# Release v1.0.0 (2024-02-09)`);
    expect(result).toContain(
      `- Initial release ([\`abc5678\`](#abc5678sdgsd441165cg)) [@John](#john@test.com)`,
    );
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
        createCommit(
          'feat: Refactor API',
          'Charlie',
          'charlie@test.com',
          'BREAKING CHANGE: The API structure has been completely overhauled.',
          'ghi9012tsbfhtyrthg852',
        ),
      ],
    });

    const result = await generateReleaseNotes(baseConfig);

    expect(result).toContain('## 💥 BREAKING CHANGES');
    expect(result).toContain(
      '- The API structure has been completely overhauled. ([`ghi9012`](#ghi9012tsbfhtyrthg852)) [@Charlie](#charlie@test.com)',
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
      all: [createCommit('docs: Update README', 'Eve', 'eve@test.com', '', 'jkl3456sdgsd441165cg')],
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
        createCommit(
          'ci: Improve pipeline speed',
          'Frank',
          'frank@test.com',
          '',
          'mno7890fdsgdfs4545115',
        ),
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

  it('should render without a title if `withTitle` is set to `false`', async () => {
    vi.spyOn(mocks, 'tags').mockResolvedValue({
      all: ['v1.0.0', 'v1.1.0'],
      latest: 'v1.1.0',
    });

    vi.spyOn(mocks, 'show').mockResolvedValue('2024-02-10 00:00:00 +0000');

    vi.spyOn(mocks, 'log').mockResolvedValue({
      all: [
        createCommit(
          'feat: Add new login feature',
          'Alice',
          'alice@test.com',
          '',
          'abc1234tnhfkienfgdfgdf5445cg',
        ),
      ],
    });

    const result = await generateReleaseNotes({ ...baseConfig, withTitle: false });

    expect(result).not.toContain(`# Release v1.1.0 (2024-02-10)`);
    expect(result).toContain(
      `- Add new login feature ([\`abc1234\`](#abc1234tnhfkienfgdfgdf5445cg)) [@Alice](#alice@test.com)`,
    );

    expect(result).toContain(`[v1.0.0...v1.1.0](#)`);
  });
});
