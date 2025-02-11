import { generateReleaseNotes } from './generate-release.service';
import * as fs from 'fs';
import { ExportConfiguration } from './main';

export const exportReleaseNotes = (config: ExportConfiguration): void => {
  generateReleaseNotes(config)
    .then((releaseNotes) => {
      fs.writeFileSync(config.outputPath, releaseNotes);

      console.log('✅ Release note generated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error generating release notes:', error);
      process.exit(1);
    });
};

exportReleaseNotes({
  repositoryPath: process.env.CUSTOM_REPOSITORY_PATH ?? '.',
  outputPath: process.env.CUSTOM_OUTPUT_PATH ?? 'RELEASE_NOTES.md',
  tags:
    process.env.CUSTOM_FROM_TAG && process.env.CUSTOM_TO_TAG
      ? { from: process.env.CUSTOM_FROM_TAG, to: process.env.CUSTOM_TO_TAG }
      : undefined,
});
