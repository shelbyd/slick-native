import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageSet {
  constructor(private readonly storage: AsyncStorage) {}

  async insert(value: string) {
    if (await this.storage.getItem(`values/${value}`) != null)
      return;

    const len = await this.len();
    await Promise.all([
      this.setLen(len + 1),
      this.setPair(len, value),
    ]);
  }

  private async len() {
    return JSON.parse(await this.storage.getItem('len') || '0');
  }

  private async setLen(len: number) {
    await this.storage.setItem('len', JSON.stringify(len));
  }

  async allValues(): string[] {
    return Promise.all(Array.from(Array(await this.len()).keys())
                           .map((n) => this.storage.getItem(`indices/${n}`)));
  }

  async remove(value: string) {
    const index = await this.storage.getItem(`values/${value}`);
    if (index == null)
      return;
    await this.storage.removeItem(`values/${value}`);

    const len = await this.len();
    await this.setLen(len - 1)

    const swapTo = JSON.parse(index);
    const swapFrom = len - 1;
    if (swapFrom == swapTo)
      return;

    const swapValue = await this.storage.getItem(`indices/${swapFrom}`);
    await this.setPair(swapTo, swapValue);
  }

  private async setPair(index: number, value: string) {
    await Promise.all([
      this.storage.setItem(`values/${value}`, JSON.stringify(index)),
      this.storage.setItem(`indices/${index}`, value),
    ]);
  }
}
