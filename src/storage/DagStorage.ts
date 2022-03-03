import AsyncStorage from '@react-native-async-storage/async-storage';

export class DagStorage {
  constructor(private readonly storage: AsyncStorage) {}

  async setIncoming(target: string, sources: string[]) {
    return await this.setCategory('incoming', target, 'outgoing', sources);
  }

  async setOutgoing(source: string, targets: string[]) {
    return await this.setCategory('outgoing', source, 'incoming', targets);
  }

  private async setCategory(category: string, id: string, otherCategory,
                            refs: string[]) {
    const DIFF = (a, b) => Array.from(new Set([...a ].filter(a => !b.has(a))));
    const existingRefs = new Set(await this.getCategory(category, id));
    const currentRefs = new Set(refs);

    const setThis = this.updateArray(category, id, () => refs);

    const removes = DIFF(existingRefs, currentRefs).map(async (remove) => {
      await this.updateArray(otherCategory, remove,
                             arr => arr.filter(o => o != id));
    });
    const adds = DIFF(currentRefs, existingRefs).map(async (add) => {
      await this.updateArray(otherCategory, add, arr => [...arr, id]);
    });

    await Promise.all([
      setThis,
      removes,
      adds,
    ]);
  }

  private async updateArray(category: string, id: string,
                            update: (existing: string[]) => string[]) {
    const key = `${id}/${category}`;

    const updated = update(await this.getCategory(category, id));
    if (updated.length > 0) {
      await this.storage.setItem(key, JSON.stringify(updated));
    } else {
      await this.storage.removeItem(key);
    }
  }

  async incoming(id: string): string[] {
    return this.getCategory('incoming', id);
  }

  async outgoing(id: string): string[] {
    return this.getCategory('outgoing', id);
  }

  private async getCategory(category: string, id: string) {
    const fromStorage = await this.storage.getItem(`${id}/${category}`);
    if (fromStorage == null)
      return [];

    return JSON.parse(fromStorage);
  }

  async delete(id: string) {
    await Promise.all([
      this.setIncoming(id, []),
      this.setOutgoing(id, []),
    ]);
  }
}
