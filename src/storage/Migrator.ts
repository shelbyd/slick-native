import AsyncStorage from '@react-native-async-storage/async-storage';

import {parseMigrate} from '../Item';
import {Store} from './Store';

export class Migrator {
  constructor(private readonly storage: AsyncStorage) {}

  async perform() {
    let version = await this.getVersion();

    if (version == 0) {
      // Save relationships between items in DagStorage.
      version = await this.incrementVersion(() => resaveAllItems(this.storage));
    }

    if (version == 1) {
      // Start saving ids for open items in a separate set.
      version = await this.incrementVersion(() => resaveAllItems(this.storage));
    }
  }

  private async getVersion() {
    return JSON.parse(await this.storage.getItem('@storage-meta/version') ||
                      '0');
  }

  private async setVersion(v: number) {
    await this.storage.setItem('@storage-meta/version', JSON.stringify(v));
  }

  async incrementVersion(cb: () => Promise<void>) {
    await storeSnapshot(this.storage);

    await cb();

    const version = await this.getVersion() + 1;
    await this.setVersion(version);
    return version;
  }
}

async function storeSnapshot(storage: AsyncStorage) {
  const keys =
      (await storage.getAllKeys()).filter(k => !k.startsWith('@storage-meta'));
  const items = await storage.multiGet(keys);
  await storage.setItem('@storage-meta/backup', JSON.stringify(items));
}

async function restoreFromSnapshot(storage: AsyncStorage) {
  const keys =
      (await storage.getAllKeys()).filter(k => !k.startsWith('@storage-meta'));
  await Promise.all(keys.map(k => storage.removeItem(k)));

  let json = JSON.parse(await storage.getItem('@storage-meta/backup'));
  for (let [key, value] of json) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    await storage.setItem(key, value);
  }
}

async function resaveAllItems(storage: AsyncStorage) {
  const store = new Store(storage);

  const keys = await storage.getAllKeys();
  const items = await Promise.all(
      keys.filter(k => k.startsWith('@items/')).map(async (key) => {
        const json = await storage.getItem(key);
        const [item, _didMigrate] = parseMigrate(json);
        return item;
      }));
  for (const item of items) {
    await store.save(item);
  }
}
