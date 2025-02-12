import { GenerateConfiguration } from './generate-configuration.type';

export type CliConfiguration = {
  /** The path to save the release notes file with the file name */
  output: string;
} & GenerateConfiguration;
