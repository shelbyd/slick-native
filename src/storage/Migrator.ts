import AsyncStorage from '@react-native-async-storage/async-storage';

import {parseMigrate} from '../Item';
import {Store} from './Store';

export class Migrator {
  constructor(private readonly storage: AsyncStorage) {}

  async perform() {
    let version = await this.storage.getItem('@storage-meta/version');
    if (version == null) {
      await storeSnapshot(this.storage);
      await parentChildDag(this.storage);
      version = 1;
      await this.storage.setItem('@storage-meta/version',
                                 JSON.stringify(version));
    }
  }
}

async function storeSnapshot(storage: AsyncStorage) {
  const keys =
      (await storage.getAllKeys()).filter(k => !k.startsWith('@storage-meta'));
  const items = await storage.multiGet(keys);
  await storage.setItem('@storage-meta/backup', JSON.stringify(items));
}

async function parentChildDag(storage: AsyncStorage) {
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
