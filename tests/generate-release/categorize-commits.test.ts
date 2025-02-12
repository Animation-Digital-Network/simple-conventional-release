import { describe, it, expect } from 'vitest';
import { categorizeCommits } from '../../src/generate-release.service'; // Adjust path if needed
import { CommitSections } from '../../src/types/commit-sections.type';
import { CommitCategory } from '../../src/enums/commit-category.enum';
import { LogResult } from 'simple-git';
import { createCommit } from '../helpers/create-commit.helper';

describe('categorizeCommits', () => {
  it('should correctly categorize feature commits', () => {
    const commit1 = createCommit('feat: Add dark mode', 'Alice', 'alice@test.com');
    const commit2 = createCommit('feat(ui): Improve navbar design', 'Bob', 'bob@test.com');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- Add dark mode ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) [@${commit1.author_name}](#${commit1.author_email})`,
      `- **ui** Improve navbar design ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) [@${commit2.author_name}](#${commit2.author_email})`,
    ]);
  });

  it('should correctly categorize fix commits', () => {
    const commit1 = createCommit('fix: Resolve memory leak', 'Charlie', 'charlie@test.com');
    const commit2 = createCommit('fix(db): Improve connection handling', 'Dave', 'dave@test.com');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    expect(sections[CommitCategory.BUG_FIXES]).toEqual([
      `- Resolve memory leak ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) [@${commit1.author_name}](#${commit1.author_email})`,
      `- **db** Improve connection handling ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) [@${commit2.author_name}](#${commit2.author_email})`,
    ]);
  });

  it('should handle empty commit logs', () => {
    const logs: LogResult = {
      all: [],
      total: 0,
      latest: null,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    // Expect all categories to be empty
    Object.values(sections).forEach((category) => {
      expect(category).toEqual([]);
    });
  });

  it('should categorize commits with no prefix as "Unspecified Type"', () => {
    const commit1 = createCommit(
      'Refactored codebase for better readability',
      'Mia',
      'mia@test.com',
    );
    const commit2 = createCommit('Updated dependencies', 'Noah', 'noah@test.com');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    expect(sections[CommitCategory.UNSPECIFIED]).toEqual([
      `- Refactored codebase for better readability ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) [@${commit1.author_name}](#${commit1.author_email})`,
      `- Updated dependencies ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) [@${commit2.author_name}](#${commit2.author_email})`,
    ]);
  });

  it('should correctly detect BREAKING CHANGE messages in commit body', () => {
    const commit = createCommit(
      'feat(core): Introduce new API',
      'Olivia',
      'olivia@test.com',
      'BREAKING CHANGE: This removes v1 API endpoints.',
    );

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- **core** Introduce new API ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);

    expect(sections[CommitCategory.BREAKING_CHANGES]).toEqual([
      `- This removes v1 API endpoints. ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);
  });

  it('should correctly detect BREAKING CHANGE messages in commit body footer', () => {
    const commit = createCommit(
      'feat(core): Introduce new API',
      'Olivia',
      'olivia@test.com',
      `
      This commit introduces a new API for the core module.

      It also includes a BREAKING CHANGE in the footer.

      BREAKING CHANGE: This removes v1 API endpoints.
      `,
    );

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- **core** Introduce new API ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);

    expect(sections[CommitCategory.BREAKING_CHANGES]).toEqual([
      `- This removes v1 API endpoints. ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);
  });

  it('should correctly detect BREAKING CHANGE messages if ! is declared and footer too', () => {
    const commit = createCommit(
      'feat!: Introduce new API',
      'Olivia',
      'olivia@test.com',
      `
      This commit introduces a new API for the core module.

      It also includes a BREAKING CHANGE in the footer.

      BREAKING CHANGE: This removes v1 API endpoints.
      `,
    );

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- Introduce new API ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);

    expect(sections[CommitCategory.BREAKING_CHANGES]).toEqual([
      `- This removes v1 API endpoints. ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);
  });

  it('should correctly detect BREAKING CHANGE messages if ! is declared with scope', () => {
    const commit = createCommit('feat(core)!: Introduce new API', 'Olivia', 'olivia@test.com');

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections: CommitSections = categorizeCommits(logs, 'v1.0.0');

    expect(sections[CommitCategory.BREAKING_CHANGES]).toEqual([
      `- **core** Introduce new API ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);

    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- **core** Introduce new API ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);
  });

  it('should correctly categorize commits with extra spaces in messages', () => {
    const commit = createCommit('feat:    Add extra spacing issue', 'Alice', 'alice@test.com');

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections = categorizeCommits(logs, 'v1.0.0');
    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- Add extra spacing issue ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);
  });

  it('should correctly categorize mixed case commit types with lowercase forcing', () => {
    const commit1 = createCommit('FeAt: New feature', 'Eve', 'eve@test.com');
    const commit2 = createCommit('FIX: Critical fix', 'Frank', 'frank@test.com');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections = categorizeCommits(logs, 'v1.0.0');
    expect(sections[CommitCategory.UNSPECIFIED]).toEqual([
      `- FeAt: New feature ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) [@${commit1.author_name}](#${commit1.author_email})`,
      `- FIX: Critical fix ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) [@${commit2.author_name}](#${commit2.author_email})`,
    ]);
  });

  it('should correctly extract the scope with special characters', () => {
    const commit = createCommit('feat(user-auth): Improve login flow', 'Bob', 'bob@test.com');

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections = categorizeCommits(logs, 'v1.0.0');
    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- **user-auth** Improve login flow ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);
  });

  it('should assign default description for missing descriptions', () => {
    const commit1 = createCommit('feat:', 'Grace', 'grace@test.com');
    const commit2 = createCommit('fix(db):', 'Hank', 'hank@test.com');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections = categorizeCommits(logs, 'v1.0.0');
    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- no description ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) [@${commit1.author_name}](#${commit1.author_email})`,
    ]);
    expect(sections[CommitCategory.BUG_FIXES]).toEqual([
      `- **db** no description ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) [@${commit2.author_name}](#${commit2.author_email})`,
    ]);
  });

  it('should categorize unconventional prefixes as "Unspecified Type"', () => {
    const commit = createCommit('unknown: This should not be categorized', 'Jack', 'jack@test.com');

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections = categorizeCommits(logs, 'v1.0.0');
    expect(sections[CommitCategory.UNSPECIFIED]).toEqual([
      `- unknown: This should not be categorized ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) [@${commit.author_name}](#${commit.author_email})`,
    ]);
  });
});
