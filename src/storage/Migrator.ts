import AsyncStorage from '@react-native-async-storage/async-storage';

import {parseMigrate} from '../Item';
import {Store} from './Store';

export class Migrator {
  constructor(private readonly storage: AsyncStorage) {}

  async perform() {
    await this.migrateLatest(2, async (version) => {
      if (version == 0) {
        // Save relationships between items in DagStorage.
        await resaveAllItems(this.storage);
      }

      if (version == 1) {
        // Start saving ids for open items in a separate set.
        await resaveAllItems(this.storage);
      }
    })
  }

  private async migrateLatest(latestVersion: number, cb: (version: number) => Promise<void>) {
    const current = await this.getVersion();
    if (current == latestVersion) {
      console.log('Already at latest version', current);
      return;
    }

    console.log('Migrating from', current, 'to', latestVersion);

    await storeSnapshot(this.storage);
    await cb(current);

    await this.setVersion(latestVersion);
  }

  private async getVersion() {
    return JSON.parse(await this.storage.getItem('@storage-meta/version') ||
                      '0');
  }

  private async setVersion(v: number) {
    await this.storage.setItem('@storage-meta/version', JSON.stringify(v));
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
