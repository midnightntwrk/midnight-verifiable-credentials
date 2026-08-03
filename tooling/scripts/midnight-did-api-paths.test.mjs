import { describe, expect, it } from 'vitest';

import { isMidnightDidApiStoreEntry } from './midnight-did-api-paths.mjs';

describe('midnight DID API pnpm-store discovery', () => {
  it('recognizes registry and file-backed DID API package entries', () => {
    expect(
      isMidnightDidApiStoreEntry(
        '@midnight-ntwrk+midnight-did-api@0.5.0_abc123',
      ),
    ).toBe(true);
    expect(
      isMidnightDidApiStoreEntry(
        '@midnight-ntwrk+midnight-did-api@file+..+midnight-did+packages+api',
      ),
    ).toBe(true);
  });

  it('rejects unrelated pnpm-store entries', () => {
    expect(
      isMidnightDidApiStoreEntry(
        '@midnight-ntwrk+midnight-did-contract@0.5.0',
      ),
    ).toBe(false);
  });
});
