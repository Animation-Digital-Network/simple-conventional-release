import { GenerateConfiguration } from './generate-configuration.type';

export type ExportConfiguration = {
  /** The path to save the release notes file with the file name */
  outputPath: string;
} & GenerateConfiguration;
