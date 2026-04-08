import { UriString } from '@atproto/lex';

export function normalizeUrl(url: string) {
  return new URL(url).toString() as UriString;
}