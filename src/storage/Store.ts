import AsyncStorage from '@react-native-async-storage/async-storage';
import deepEqual from 'deep-equal';
import {BehaviorSubject, EMPTY, Observable, ReplaySubject, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

import {Item, parseMigrate} from '../Item';

import {DagStorage} from './DagStorage';
import {ScopedStorage} from './ScopedStorage';

export class Store {
  public readonly savingSubject = new BehaviorSubject(0);

  private readonly _openItems = new ReplaySubject(1);
  private readonly itemUpdates = new Subject();

  private readonly items = new ScopedStorage(this.backing, '@items');

  // Parent -> Child
  private readonly parentChild =
      new DagStorage(new ScopedStorage(this.backing, '@parent-child'));
  // Blocker -> Blocking
  private readonly blocking =
      new DagStorage(new ScopedStorage(this.backing, '@blockers'));

  constructor(private readonly backing: AsyncStorage) {}

  async save(item: Item) {
    this.savingSubject.next(this.savingSubject.value + 1);

    try {
      if (item.title == "") {
        return await this.delete(item.id);
      }

      const saved = await this.load(item.id);
      await this.items.setItem(item.id, JSON.stringify(item));
      await this.maintainContraints(saved, item);
      this.itemUpdates.next({id : item.id, value : item});
      await this.notifyItemChange();
    } finally {
      this.savingSubject.next(this.savingSubject.value - 1);
    }
  }

  async delete(id: string) {
    const saved = await this.load(id);

    await this.items.removeItem(id);
    await this.maintainContraints(saved, null);

    this.itemUpdates.next({id, value : null});
    await this.notifyItemChange();
  }

  async load(id: string|null): Promise<Item|null> {
    if (id == null)
      return null;

    const json = await this.items.getItem(id);
    if (json == null)
      return null;

    let [item, didMigrate] = parseMigrate(json);

    await Promise.all([
      async () => {
        const [parent, ] = await this.parentChild.incoming(id);
        item.parent = parent ?? null;
      },
      async () => { item.children = await this.parentChild.outgoing(id); },
      async () => { item.blockers = await this.blocking.incoming(id); },
      async () => { item.blocking = await this.blocking.outgoing(id); },
    ].map(fn => fn()));

    if (didMigrate) {
      await this.save(item);
      return await this.load(id);
    }

    return item;
  }

  async update(id: string|null, mutate: (item: Item) => void) {
    const notMutated = await this.load(id);
    if (notMutated == null)
      return;

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
    const keys = await this.items.getAllKeys();
    const withKeys = await this.items.multiGet(keys);
    const migrated = withKeys.map(([ _key, json ]) => parseMigrate(json));

    for (const [item, didMigrate] of migrated) {
      if (didMigrate) {
        await this.save(item);
      }
    }

    const items = migrated.map(([ item, _ ]) => item);
    this._openItems.next(items);
  }

  watch(id: string|null): Observable<Item|null> {
    if (id == null)
      return EMPTY;

    (async () => {
      const item = await this.load(id);
      if (item == null)
        return;

      this.itemUpdates.next({id, value : item});
    })();

    return this.itemUpdates.pipe(filter(({id : itemId}) => itemId == id),
                                 map(({value}) => value));
  }

  private async maintainContraints(previous: Item|null, current: Item|null) {
    if (deepEqual(previous, current))
      return;

    if (current == null) {
      await this.parentChild.delete(previous.id);
      await this.blocking.delete(previous.id);
    } else {
      const parent = current.parent == null ? [] : [ current.parent ];
      await this.parentChild.setIncoming(current.id, parent);
      await this.parentChild.setOutgoing(current.id, current.children);

      await this.blocking.setIncoming(current.id, current.blockers);
      await this.blocking.setOutgoing(current.id, current.blocking);
    }
  }
}
