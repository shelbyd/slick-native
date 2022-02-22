import deepEqual from 'deep-equal';
import { EMPTY, BehaviorSubject, ReplaySubject, Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Item, parseMigrate } from './Item';

export class Store {
  public readonly savingSubject = new BehaviorSubject(0);

  private readonly _openItems = new ReplaySubject(1);
  private readonly itemUpdates = new Subject();

  constructor(private readonly backing: AsyncStorage) {}

  async save(item: Item) {
    this.savingSubject.next(this.savingSubject.value + 1);

    try {
      if (item.title == "") {
        return await this.delete(item.id);
      }

      const saved = await this.load(item.id);
      await this.backing.setItem(`@items/${item.id}`, JSON.stringify(item));
      await this.maintainContraints(saved, item);
      this.itemUpdates.next({id: item.id, value: item});
      await this.notifyItemChange();
    } finally {
      this.savingSubject.next(this.savingSubject.value - 1);
    }
  }

  async delete(id: string) {
    const saved = await this.load(id);

    await this.backing.removeItem(`@items/${id}`);
    await this.maintainContraints(saved, null);

    this.itemUpdates.next({id, value: null});
    await this.notifyItemChange();
  }

  async load(id: string|null): Promise<Item|null> {
    if (id == null) return null;

    const json = await this.backing.getItem(`@items/${id}`);
    if (json == null) return null;

    const [item, didMigrate] = parseMigrate(json);
    if (didMigrate) {
      await this.save(item);
    }
    return item;
  }

  async update(id: string|null, mutate: (item: Item) => void) {
    const notMutated = await this.load(id);
    if (notMutated == null) return;

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

  watch(id: string|null): Observable<Item|null> {
    if (id == null) return EMPTY;

    (async () => {
      const item = await this.load(id);
      this.itemUpdates.next({id: item.id, value: item});
    })();

    return this.itemUpdates.pipe(
      filter(({id: itemId}) => itemId == id),
      map(({value}) => value)
    );
  }

  private async maintainContraints(previous: Item|null, current: Item|null) {
    if (deepEqual(previous, current)) return;

    if (previous?.parent != current?.parent) {
      await this.update(previous?.parent, (parent) => {
        parent.children = parent.children.filter(id => id !== previous.id);
      });

      await this.update(current?.parent, (parent) => {
        if (!parent.children.includes(current.id)) {
          parent.children.push(current.id);
        }
      });
    }

    const previousChildren = new Set(previous?.children || []);
    const currentChildren = new Set(current?.children || []);

    const diff = (a, b) => new Set([...a].filter(a => !b.has(a)));

    for (const childId of diff(previousChildren, currentChildren)) {
      await this.update(childId, child => child.parent = null);
    }

    for (const childId of diff(currentChildren, previousChildren)) {
      await this.update(childId, (child) => child.parent = current.id);
    }
  }
}
