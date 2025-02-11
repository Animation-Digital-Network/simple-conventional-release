import { faker } from '@faker-js/faker';
import { DefaultLogFields } from 'simple-git';

// Helper function to create commit logs with required fields
export const createCommit = (
  message: string,
  authorName: string,
  authorEmail: string,
  body: string = '',
  hash: string = faker.git.commitSha(),
  date: string = faker.git.commitDate(),
): DefaultLogFields => {
  return {
    hash,
    date,
    message,
    refs: '',
    body,
    author_name: authorName,
    author_email: authorEmail,
  };
};
