const KEY = "allowedOrigins";
interface AllowedOriginState {
  allowedOrigins: string[]
}

export class AllowedOriginService {

  static async getAll(): Promise<string[]> {
    const result = await chrome.storage.local.get(KEY) as AllowedOriginState;
    return result[KEY] ?? [];
  }

  static async isExist(origin: string): Promise<boolean> {
    const origins = await this.getAll();
    return origins.includes(origin);
  }

  static async push(origin: string) {
    const origins = await this.getAll();

    if (!origins.includes(origin)) {
      origins.push(origin);
      await chrome.storage.local.set({ [KEY]: origins });
    }
  }

  static async remove(origin: string) {
    const origins = await this.getAll();
    const updated = origins.filter(o => o !== origin);

    await chrome.storage.local.set({ [KEY]: updated });
  }

  static async clear() {
    await chrome.storage.local.set({ [KEY]: [] });
  }
}