#!/usr/bin/env node

import fs from 'fs';
import { Command } from 'commander';
import { generateReleaseNotes } from './generate-release.service';
import { version } from '../package.json';
import { z } from 'zod';
import { CliConfiguration } from './types/cli-configuration.type';

const program = new Command();

program
  .version(version)
  .description('Generate release notes based on Git commit history')
  .option('-r, --repository <path>', 'Path to the Git repository', '.')
  .option('-o, --output <file>', 'Output file for release notes', 'RELEASE_NOTES.md')
  .option('--from <tag>', 'Starting tag for release notes')
  .option('--to <tag>', 'Ending tag for release notes')
  .option('--with-title <value>', 'Include title in the output true or false', 'true')
  .parse(process.argv);

const options = z
  .object({
    repository: z.string().optional(),
    output: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    withTitle: z
      .string()
      .transform((value) => value.toLowerCase() == 'true' || value == '1')
      .optional(),
  })
  .parse(program.opts());

export const exportReleaseNotes = (config: CliConfiguration): void => {
  generateReleaseNotes(config)
    .then((releaseNotes) => {
      fs.writeFileSync(config.output, releaseNotes);

      console.log('✅ Release note generated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error generating release notes:', error);
      process.exit(1);
    });
};

let tags = undefined;

if (options.from && options.to) {
  tags = { from: options.from, to: options.to };
} else if (options.to) {
  tags = { to: options.to };
}

exportReleaseNotes({
  repositoryPath: options.repository ?? '.',
  output: options.output ?? 'RELEASE_NOTES.md',
  tags,
  withTitle: options.withTitle,
});
