import deepEqual from 'deep-equal';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Item, parseMigrate } from './Item';

export class Store {
  public readonly savingSubject = new BehaviorSubject(0);

  private readonly _openItems = new ReplaySubject(1);

  constructor(private readonly backing: AsyncStorage) {}

  async save(item: Item) {
    this.savingSubject.next(this.savingSubject.value + 1);

    if (item.title == "") {
      console.log('Deleting item', item);
      await this.backing.removeItem(`@items/${item.id}`);

      if (item.parent != null) {
        await this.update(item.parent, (parent) => {
          parent.children = parent.children.filter(id => id !== item.id);
        });
      }
      await Promise.all(item.children.map(async (childId) => {
        await this.update(childId, (child) => child.parent = null);
      }));
    } else {
      console.log('Saving item', item);
      await this.backing.setItem(`@items/${item.id}`, JSON.stringify(item));

      if (item.parent != null) {
        await this.update(item.parent, (parent) => {
          if (!parent.children.includes(item.id)) {
            parent.children.push(item.id);
          }
        });
      }
      await Promise.all(item.children.map(async (childId) => {
        await this.update(childId, (child) => child.parent = item.id);
      }));
    }

    this.savingSubject.next(this.savingSubject.value - 1);
    await this.notifyItemChange();
  }

  async load(id: string): Promise<Item|null> {
    const json = await this.backing.getItem(`@items/${id}`);
    const [item, didMigrate] = parseMigrate(json);
    if (didMigrate) {
      await this.save(item);
    }
    return item;
  }

  async update(id: string, mutate: (item: Item) => void) {
    const notMutated = await this.load(id);
    const mutated = await this.load(id);
    mutate(mutated);

    if (!deepEqual(notMutated, mutated)) {
      await this.save(mutated);
    }
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
