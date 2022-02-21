import { empty, Item } from './Item';
import { Store } from './Store';

class MockStorage {
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

  getAllKeys(): string[] {
    return Array.from(this.map.keys());
  }

  multiGet(keys: string[]) {
    return keys.map(k => [k, this.getItem(k)]);
  }
}

function watch(obs: Observable<T>): T[] {
  let seen = [];
  obs.subscribe(t => {
    seen.push(t);
  });
  return seen;
}

describe('Store', () => {
  let store;
  let storage;

  beforeEach(() => {
    storage = new MockStorage();
    store = new Store(storage);
  });

  function savable(): Item {
    return {
      ...empty(),
      title: 'Savable',
    };
  }

  it('saves an item', async () => {
    const item = savable();
    await store.save(item);

    expect(await store.load(item.id)).toEqual(item);
  });

  it('deletes an item with empty title', async () => {
    const item = savable();
    await store.save(item);

    item.title = "";
    await store.save(item);

    expect(await store.load(item.it)).toEqual(null);
  });

  describe('parent/child', () => {
    it('updates parent when child gains parent id', async () => {
      const parent = savable();
      await store.save(parent);

      const child = savable();
      child.parent = parent.id;
      await store.save(child);

      expect((await store.load(parent.id)).children).toEqual([child.id]);
    });

    it('updates child when parent gains child id', async () => {
      const child = savable();
      await store.save(child);

      const parent = savable();
      parent.children.push(child.id);
      await store.save(parent);

      expect((await store.load(child.id)).parent).toEqual(parent.id);
    });

    it('updates parent when child loses parent id', async () => {
      const parent = savable();
      await store.save(parent);

      const child = savable();
      child.parent = parent.id;
      await store.save(child);

      child.parent = null;
      await store.save(child);

      expect((await store.load(parent.id)).children).toEqual([]);
    });

    it('updates parent when child is deleted', async () => {
      const parent = savable();
      await store.save(parent);

      const child = savable();
      child.parent = parent.id;
      await store.save(child);

      child.title = '';
      await store.save(child);

      expect((await store.load(parent.id)).children).toEqual([]);
    });

    it('updates children when parent is deleted', async () => {
      let parent = savable();
      await store.save(parent);

      const child = savable();
      child.parent = parent.id;
      await store.save(child);

      parent = await store.load(parent.id);
      parent.title = '';
      await store.save(parent);

      expect((await store.load(child.id)).parent).toEqual(null);
    });

    it('updates old parent when parent changes', async () => {
      let oldParent = savable();
      await store.save(oldParent);

      const child = savable();
      child.parent = oldParent.id;
      await store.save(child);

      let newParent = savable();
      await store.save(newParent);

      child.parent = newParent.id;
      await store.save(child);

      expect((await store.load(oldParent.id)).children).toEqual([]);
    });

    it('updates child when removed from parent', async () => {
      let parent = savable();
      await store.save(parent);

      const child = savable();
      child.parent = parent.id;
      await store.save(child);

      parent = await store.load(parent.id);
      parent.children = [];
      await store.save(parent);

      expect((await store.load(child.id)).parent).toEqual(null);
    });
  });

  describe('openItems', () => {
    it('immediately gives list when called', async () => {
      const seen = watch(store.openItems());
      await new Promise(resolve => setTimeout(resolve));

      expect(seen.length).toEqual(1);
    });

    it('gives list when item saved', async () => {
      const seen = watch(store.openItems());
      await new Promise(resolve => setTimeout(resolve));

      const item = savable();
      await store.save(item);

      expect(seen.length).toEqual(2);
      expect(seen[1][0].id).toEqual(item.id);
    });
  });

  describe('savingSubject', () => {
    it('is 0', () => {
      const seen = watch(store.savingSubject);

      expect(seen).toEqual([0]);
    });

    it('is 1 during save', async () => {
      const seen = watch(store.savingSubject);

      await store.save(savable());

      expect(seen).toEqual([0, 1, 0]);
    });
  });
});
