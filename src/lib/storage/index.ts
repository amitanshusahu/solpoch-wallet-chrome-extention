import type { Persister, PersistedClient } from "@tanstack/react-query-persist-client";

const CHROME_STORAGE_KEY = 'REACT_QUERY_CACHE_SOLPOCH';

export const chromeStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await chrome.storage.local.set({
      [CHROME_STORAGE_KEY]: client,
    });
  },

  restoreClient: async (): Promise<PersistedClient | undefined> => {
    const result = await chrome.storage.local.get(CHROME_STORAGE_KEY);
    return result[CHROME_STORAGE_KEY] as PersistedClient | undefined;
  },

  removeClient: async () => {
    await chrome.storage.local.remove(CHROME_STORAGE_KEY);
  },
};