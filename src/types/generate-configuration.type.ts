export type GenerateConfiguration = {
  /** The path to the Git repository to generate release notes for */
  repositoryPath: string;

  tags?: {
    from?: string; // The tag to start generating release notes from
    to: string; // The tag to end generating release notes at
  };

  withTitle?: boolean; // Include the title in the release notes
};
