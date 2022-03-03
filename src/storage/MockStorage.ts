export class MockStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string|null {
    return this.map.get(key);
  }

  setItem(key: string, value: string) {
    return this.map.set(key, value);
  }

  removeItem(key: string) {
    this.map.delete(key);
  }

  async getAllKeys(): string[] {
    return Array.from(this.map.keys());
  }

  multiGet(keys: string[]) {
    return keys.map(k => [k, this.getItem(k)]);
  }
}

