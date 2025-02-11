/**
 * Enum representing different categories of commit messages
 * following the Conventional Commit format.
 */
export enum CommitCategory {
  /** New features or enhancements */
  FEATURES = '🚀 Features',

  /** Bug fixes */
  BUG_FIXES = '🐛 Bug Fixes',

  /** Code refactoring without changing functionality */
  REFACTORS = '🔧 Refactors',

  /** Performance improvements */
  PERFORMANCE = '⚡ Performance',

  /** Documentation changes */
  DOCUMENTATION = '📚 Documentation',

  /** Changes related to testing */
  TESTS = '🧪 Tests',

  /** Changes to the build process */
  BUILD = '🏗️ Build',

  /** Changes to CI/CD pipelines */
  CI = '🔄 CI/CD',

  /** Code style improvements */
  STYLING = '💄 Styling',

  /** General maintenance tasks (`chore`) */
  CHORES = '🛠️ Chores',

  /** Reverted changes */
  REVERTS = '🔙 Reverts',

  /** Commits that do not follow the Conventional Commit format */
  UNSPECIFIED = '🔍 Unspecified Type',

  /** Breaking changes */
  BREAKING_CHANGES = '💥 BREAKING CHANGES',
}
