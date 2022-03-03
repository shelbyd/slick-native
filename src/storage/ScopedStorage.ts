import AsyncStorage from '@react-native-async-storage/async-storage';

export class ScopedStorage implements AsyncStorage {
  constructor(private readonly backing: AsyncStorage,
              private readonly prefix: string) {}

  private getKey(key: string): string { return `${this.prefix}/${key}`; }

  getItem(key: string) { return this.backing.getItem(this.getKey(key)); }

  multiGet(keys: string[]) {
    return this.backing.multiGet(keys.map(k => this.getKey(k)));
  }

  setItem(key: string, value: string) {
    return this.backing.setItem(this.getKey(key), value);
  }

  removeItem(key: string) { return this.backing.removeItem(this.getKey(key)); }

  async getAllKeys() {
    return (await this.backing.getAllKeys())
        .map(k => k.split(`${this.prefix}/`)[1])
        .filter(k => k != null);
  }
}
