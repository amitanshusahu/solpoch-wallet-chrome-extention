type WalletSessionState = {
  isUnlocked: boolean
  allowedSites: string[]
}

const DEFAULT_STATE: WalletSessionState = {
  isUnlocked: false,
  allowedSites: []
}

export class WalletSessionService {
  private static STORAGE_KEY = "wallet_session"

  static async getState(): Promise<WalletSessionState> {
    const result = await chrome.storage.session.get(this.STORAGE_KEY) as Record<string, WalletSessionState>
    return result[this.STORAGE_KEY] ?? DEFAULT_STATE
  }

  static async setUnlocked(value: boolean) {
    const state = await this.getState()
    await chrome.storage.session.set({
      [this.STORAGE_KEY]: {
        ...state,
        isUnlocked: value
      }
    })
  }

  static async getUnlocked(): Promise<boolean> {
    const state = await this.getState()
    return state.isUnlocked
  }

  static async allowSite(origin: string) {
    const state = await this.getState()

    if (!state.allowedSites.includes(origin)) {
      state.allowedSites.push(origin);
      await chrome.storage.session.set({
        [this.STORAGE_KEY]: state
      })
    }
  }

  static async removeSite(origin: string) {
    const state = await this.getState()
    const filtered = state.allowedSites.filter(site => site !== origin)
    await chrome.storage.session.set({
      [this.STORAGE_KEY]: {
        ...state,
        allowedSites: filtered
      }
    })
  }

  static async isSiteAllowed(origin: string): Promise<boolean> {
    const state = await this.getState()
    return state.allowedSites.includes(origin)
  }

  static async clearSession() {
    await chrome.storage.session.remove(this.STORAGE_KEY)
  }
}