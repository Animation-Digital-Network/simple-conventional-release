import { describe, it, expect } from 'vitest';
import { categorizeCommits } from '../../src/generate-release.service'; // Adjust path if needed
import { CommitSections } from '../../src/types/commit-sections.type';
import { CommitCategory } from '../../src/enums/commit-category.enum';
import { LogResult, DefaultLogFields } from 'simple-git';
import { faker } from '@faker-js/faker';

// Helper function to create commit logs with required fields
const createCommit = (message: string, author: string, body: string = ''): DefaultLogFields => {
  return {
    hash: faker.git.commitSha(),
    date: faker.git.commitDate(),
    message,
    refs: '',
    body,
    author_name: author,
    author_email: '',
  };
};

describe('categorizeCommits', () => {
  it('should correctly categorize feature commits', () => {
    const commit1 = createCommit('feat: Add dark mode', 'Alice');
    const commit2 = createCommit('feat(ui): Improve navbar design', 'Bob');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections: CommitSections = categorizeCommits(logs);

    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- Add dark mode ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) @Alice`,
      `- **ui** Improve navbar design ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) @Bob`,
    ]);
  });

  it('should correctly categorize fix commits', () => {
    const commit1 = createCommit('fix: Resolve memory leak', 'Charlie');
    const commit2 = createCommit('fix(db): Improve connection handling', 'Dave');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections: CommitSections = categorizeCommits(logs);

    expect(sections[CommitCategory.BUG_FIXES]).toEqual([
      `- Resolve memory leak ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) @Charlie`,
      `- **db** Improve connection handling ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) @Dave`,
    ]);
  });

  it('should handle empty commit logs', () => {
    const logs: LogResult = {
      all: [],
      total: 0,
      latest: null,
    };

    const sections: CommitSections = categorizeCommits(logs);

    // Expect all categories to be empty
    Object.values(sections).forEach((category) => {
      expect(category).toEqual([]);
    });
  });

  it('should categorize commits with no prefix as "Unspecified Type"', () => {
    const commit1 = createCommit('Refactored codebase for better readability', 'Mia');
    const commit2 = createCommit('Updated dependencies', 'Noah');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections: CommitSections = categorizeCommits(logs);

    expect(sections[CommitCategory.UNSPECIFIED]).toEqual([
      `- Refactored codebase for better readability ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) @Mia`,
      `- Updated dependencies ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) @Noah`,
    ]);
  });

  it('should correctly detect BREAKING CHANGE messages in commit body', () => {
    const commit = createCommit(
      'feat(core): Introduce new API',
      'Olivia',
      'BREAKING CHANGE: This removes v1 API endpoints.',
    );

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections: CommitSections = categorizeCommits(logs);

    expect(sections[CommitCategory.BREAKING_CHANGES]).toEqual([
      `- This removes v1 API endpoints. ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) @Olivia`,
    ]);
  });

  it('should correctly categorize commits with extra spaces in messages', () => {
    const commit = createCommit('feat:    Add extra spacing issue', 'Alice');

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections = categorizeCommits(logs);
    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- Add extra spacing issue ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) @Alice`,
    ]);
  });

  it('should correctly categorize mixed case commit types with lowercase forcing', () => {
    const commit1 = createCommit('FeAt: New feature', 'Eve');
    const commit2 = createCommit('FIX: Critical fix', 'Frank');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections = categorizeCommits(logs);
    expect(sections[CommitCategory.UNSPECIFIED]).toEqual([
      `- FeAt: New feature ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) @Eve`,
      `- FIX: Critical fix ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) @Frank`,
    ]);
  });

  it('should correctly extract the scope with special characters', () => {
    const commit = createCommit('feat(user-auth): Improve login flow', 'Bob');

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections = categorizeCommits(logs);
    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- **user-auth** Improve login flow ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) @Bob`,
    ]);
  });

  it('should assign default description for missing descriptions', () => {
    const commit1 = createCommit('feat:', 'Grace');
    const commit2 = createCommit('fix(db):', 'Hank');

    const logs: LogResult = {
      all: [commit1, commit2],
      total: 2,
      latest: commit2,
    };

    const sections = categorizeCommits(logs);
    expect(sections[CommitCategory.FEATURES]).toEqual([
      `- no description ([\`${commit1.hash.substring(0, 7)}\`](#${commit1.hash})) @Grace`,
    ]);
    expect(sections[CommitCategory.BUG_FIXES]).toEqual([
      `- **db** no description ([\`${commit2.hash.substring(0, 7)}\`](#${commit2.hash})) @Hank`,
    ]);
  });

  it('should categorize unconventional prefixes as "Unspecified Type"', () => {
    const commit = createCommit('unknown: This should not be categorized', 'Jack');

    const logs: LogResult = {
      all: [commit],
      total: 1,
      latest: commit,
    };

    const sections = categorizeCommits(logs);
    expect(sections[CommitCategory.UNSPECIFIED]).toEqual([
      `- unknown: This should not be categorized ([\`${commit.hash.substring(0, 7)}\`](#${commit.hash})) @Jack`,
    ]);
  });
});
