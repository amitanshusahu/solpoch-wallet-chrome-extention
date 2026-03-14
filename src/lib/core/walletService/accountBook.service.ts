const KEY = "accountBook";

interface AddressBookItem {
  name: string;
  address: string;
}

interface AccountBookState {
  accountBook: AddressBookItem[];
}


export class AccountBookService {
  static async getAll(): Promise<AddressBookItem[]> {
    const result = await chrome.storage.local.get(KEY) as AccountBookState;
    return result[KEY] ?? [];
  }

  static async add(item: AddressBookItem) {
    const accountBook = await this.getAll();
    if (accountBook.some(i => i.address === item.address)) {
      return; // prevent duplicates
    }
    accountBook.push(item);
    await chrome.storage.local.set({ [KEY]: accountBook });
  }

  static async remove(address: string) {
    const accountBook = await this.getAll();
    const updated = accountBook.filter(item => item.address !== address);
    await chrome.storage.local.set({ [KEY]: updated });
  }

  static async clear() {
    await chrome.storage.local.set({ [KEY]: [] });
  }

}