import { ReplaySubject, Observable } from 'rxjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Item, parseMigrate } from './Item';

export class Store {
  private readonly _openItems = new ReplaySubject(1);

  constructor(private readonly backing: AsyncStorage) {}

  async save(item: Item) {
    if (item.title == "") {
      console.log('Deleting item', item);
      await this.backing.removeItem(`@items/${item.id}`);
    } else {
      console.log('Saving item', item);
      await this.backing.setItem(`@items/${item.id}`, JSON.stringify(item));
    }
    this.notifyItemChange();
  }

  async load(id: string): Promise<Item|null> {
    const json = await this.backing.getItem(`@items/${id}`);
    const [item, didMigrate] = parseMigrate(json);
    if (didMigrate) {
      await this.save(item);
    }
    return item;
  }

  openItems(): Observable<Item[]> {
    this.notifyItemChange();
    return this._openItems;
  }

  private async notifyItemChange() {
    const keys = await this.backing.getAllKeys();
    const withKeys = await this.backing.multiGet(keys);
    const migrated = withKeys.map(([_key, json]) => parseMigrate(json));

    for (const [item, didMigrate] of migrated) {
      if (didMigrate) {
        await this.save(item);
      }
    }

    const items = migrated.map(([item, _]) => item);
    this._openItems.next(items);
  }
}
