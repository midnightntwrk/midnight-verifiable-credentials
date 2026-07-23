const didApiStorePrefix = '@midnight-ntwrk+midnight-did-api@';

export const isMidnightDidApiStoreEntry = (entry) =>
  entry.startsWith(didApiStorePrefix);
