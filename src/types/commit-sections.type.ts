import { CommitCategory } from '../enums/commit-category.enum';

/**
 * Represents categorized commit messages using strict enum-based keys.
 */
export type CommitSections = Record<CommitCategory, string[]>;
