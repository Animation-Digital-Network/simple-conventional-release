import { simpleGit, LogResult, SimpleGit } from 'simple-git';
import semver from 'semver';
import { CommitSections } from './types/commit-sections.type';
import { CommitCategory } from './enums/commit-category.enum';
import { GenerateConfiguration } from './types/generate-configuration.type';

// Allowed Conventional Commit prefixes
const ALLOWED_PREFIXES = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
];

/**
 * Get the last valid tags, excluding RC versions unless the latest tag is an RC.
 */
export async function getValidTags(git: SimpleGit): Promise<{ fromTag?: string; toTag: string }> {
  const tags = (await git.tags()).all.filter((tag) => semver.valid(tag));

  if (tags.length === 0) {
    throw new Error('No valid tags found in the repository.');
  }

  // 🔥 TRI CORRECT DES TAGS
  tags.sort(semver.compare);

  if (tags.length === 1 && tags[0]) {
    console.warn('⚠️ Only one valid tag found. Using all commits up to this tag.');
    return { toTag: tags[0] };
  }

  const lastTag = tags[tags.length - 1];
  const prevTag = tags[tags.length - 2];

  if (lastTag && lastTag.includes('-rc')) {
    return { fromTag: prevTag, toTag: lastTag };
  }

  const stableTags = tags.filter((tag) => !tag.includes('-rc'));

  const toTag = stableTags[stableTags.length - 1];

  if (!toTag) {
    throw new Error('No stable tags found in the repository.');
  }

  return {
    fromTag: stableTags.length > 1 ? stableTags[stableTags.length - 2] : undefined,
    toTag,
  };
}

/**
 * Validate if given tags exist in the repository.
 */
export async function validateTags(
  git: SimpleGit,
  tagFrom: string,
  tagTo: string,
): Promise<boolean> {
  const tags = (await git.tags()).all;
  return tags.includes(tagFrom) && tags.includes(tagTo);
}

/**
 * Get the commit date of a tag.
 */
export async function getTagDate(git: SimpleGit, tag: string): Promise<string> {
  const dateOutput = await git.show(['-s', '--format=%ci', tag]);
  const date = dateOutput.trim().split(' ')[0]; // Format YYYY-MM-DD

  if (!dateOutput || typeof dateOutput !== 'string' || !dateOutput.includes(' ') || !date) {
    throw new Error(`No valid date found for tag ${tag}`);
  }

  return date;
}

/**
 * Categorize commits based on Conventional Commits and return formatted sections.
 */
export function categorizeCommits(logs: LogResult): CommitSections {
  const sections: CommitSections = {
    [CommitCategory.BREAKING_CHANGES]: [],
    [CommitCategory.FEATURES]: [],
    [CommitCategory.BUG_FIXES]: [],
    [CommitCategory.REFACTORS]: [],
    [CommitCategory.PERFORMANCE]: [],
    [CommitCategory.DOCUMENTATION]: [],
    [CommitCategory.TESTS]: [],
    [CommitCategory.BUILD]: [],
    [CommitCategory.CI]: [],
    [CommitCategory.STYLING]: [],
    [CommitCategory.CHORES]: [],
    [CommitCategory.REVERTS]: [],
    [CommitCategory.UNSPECIFIED]: [],
  };

  const ciProjectUrl = process.env.GITHUB_REPOSITORY
    ? `https://github.com/${process.env.GITHUB_REPOSITORY}`
    : process.env.CI_PROJECT_URL;

  logs.all.forEach(
    ({ message, author_name: authorName, author_email: authorEmail, hash, body }) => {
      // Extract commit type, scope, and description
      const match = message.match(
        new RegExp(`^(${ALLOWED_PREFIXES.join('|')})(?:\\(([^)]+)\\))?(!)?:\\s?(.*)$`),
      );

      const shortHash = hash ? hash.substring(0, 7) : ''; // Get first 7 chars of hash
      const commitUrl = ciProjectUrl ? `${ciProjectUrl}/commit/${hash}` : `#${hash}`;
      const authorUrl = ciProjectUrl
        ? `${ciProjectUrl}/commits?author=${authorEmail}`
        : `#${authorEmail}`;

      let breakingChange: string | undefined;

      let formattedMessage: string;
      if (match) {
        const [, type, scope, isBreaking, description] = match;
        formattedMessage = `- ${scope ? `**${scope}** ` : ''}${description?.trim() || 'no description'} ([\`${shortHash}\`](${commitUrl})) [@${authorName}](${authorUrl})`;

        switch (type) {
          case 'feat':
            sections[CommitCategory.FEATURES].push(formattedMessage);
            break;
          case 'fix':
            sections[CommitCategory.BUG_FIXES].push(formattedMessage);
            break;
          case 'refactor':
            sections[CommitCategory.REFACTORS].push(formattedMessage);
            break;
          case 'perf':
            sections[CommitCategory.PERFORMANCE].push(formattedMessage);
            break;
          case 'docs':
            sections[CommitCategory.DOCUMENTATION].push(formattedMessage);
            break;
          case 'test':
            sections[CommitCategory.TESTS].push(formattedMessage);
            break;
          case 'build':
            sections[CommitCategory.BUILD].push(formattedMessage);
            break;
          case 'ci':
            sections[CommitCategory.CI].push(formattedMessage);
            break;
          case 'style':
            sections[CommitCategory.STYLING].push(formattedMessage);
            break;
          case 'chore':
            sections[CommitCategory.CHORES].push(formattedMessage);
            break;
          case 'revert':
            sections[CommitCategory.REVERTS].push(formattedMessage);
            break;
          default:
            sections[CommitCategory.UNSPECIFIED].push(formattedMessage);
        }

        // 🔥 If commit contains `!`, also add it to BREAKING CHANGES
        if (isBreaking) {
          breakingChange = formattedMessage;
        }
      } else {
        sections[CommitCategory.UNSPECIFIED].push(
          `- ${message.trim()} ([\`${shortHash}\`](${commitUrl})) [@${authorName}](${authorUrl})`,
        );
      }

      // 💥 Detect BREAKING CHANGES in commit body
      if (body.includes('BREAKING CHANGE:')) {
        const breakingMessage = body.split('BREAKING CHANGE:')[1]?.trim() || 'No details provided';
        breakingChange = `- ${breakingMessage} ([\`${shortHash}\`](${commitUrl})) [@${authorName}](${authorUrl})`;
      }

      if (breakingChange) {
        sections[CommitCategory.BREAKING_CHANGES].push(breakingChange);
      }
    },
  );

  return sections;
}

/**
 * Generate and save the release notes in Markdown format.
 */
export async function generateReleaseNotes(config: GenerateConfiguration): Promise<string> {
  const git = simpleGit(config.repositoryPath);

  let fromTag: string | undefined = config.tags?.from;
  let toTag: string | undefined = config.tags?.to;

  // If `config.tags` is present but empty `{}`, fall back to automatic behavior.
  const hasTagsInConfig = config.tags && Object.keys(config.tags).length > 0;

  // Ensure at least `toTag` is provided in the configuration
  if (!toTag) {
    const validTags = await getValidTags(git);
    fromTag = validTags.fromTag;
    toTag = validTags.toTag;
  }

  // If only `toTag` is provided, retrieve all commits up to `toTag`
  const isSingleTag = !fromTag && !!toTag;
  const logParams = isSingleTag ? { to: toTag } : { from: fromTag, to: toTag };

  // Validate manually provided tags if both `fromTag` and `toTag` exist
  if (hasTagsInConfig && fromTag && toTag && !(await validateTags(git, fromTag, toTag))) {
    throw new Error('Invalid tags provided or not enough valid tags to generate a release note.');
  }

  // Get release date from `toTag`
  const releaseDate = await getTagDate(git, toTag);

  console.log(
    `📌 Generating release notes from ${fromTag ?? 'initial commit'} to ${toTag} (Release Date: ${releaseDate})`,
  );

  if (!fromTag) {
    logParams.from = (await git.log({})).all.at(-1)?.hash;
  }

  const logs = await git.log(logParams);

  if (logs.all.length === 0) {
    throw new Error(`No commits found between the specified tags ${JSON.stringify(logParams)} .`);
  }

  const sections = categorizeCommits(logs);

  let releaseNotes = `# Release ${toTag} (${releaseDate})\n\n`;

  Object.entries(sections).forEach(([title, commits]) => {
    if (commits.length) {
      releaseNotes += `## ${title}\n${commits.join('\n')}\n\n`;
    }
  });

  // Generate full changelog link
  const ciProjectUrl = process.env.CI_PROJECT_URL || process.env.GITHUB_REPOSITORY;
  let changelogUrl = '#';

  if (ciProjectUrl) {
    if (process.env.GITHUB_REPOSITORY) {
      changelogUrl = `https://github.com/${ciProjectUrl}/compare/${fromTag ?? ''}...${toTag}`;
    } else if (process.env.CI_PROJECT_URL) {
      changelogUrl = `${ciProjectUrl}/-/compare/${fromTag ?? ''}...${toTag}`;
    }
  }

  releaseNotes += `## 🔗 Full Changelog\n`;
  releaseNotes += `[${fromTag ?? 'initial commit'}...${toTag}](${changelogUrl})\n`;

  return releaseNotes;
}
