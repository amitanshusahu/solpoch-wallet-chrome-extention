import { create } from 'zustand';
import type { Account } from '../types/vault';

interface AccountState {
  account: Account | null;
  setAccount: (account: Account | null) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),
}))