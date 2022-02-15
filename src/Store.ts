import AsyncStorage from '@react-native-async-storage/async-storage';

import { Item } from './Item';

export class Store {
  constructor(private readonly backing: AsyncStorage) {}

  async save(item: Item) {
    await this.backing.setItem(`@items/${item.id}`, JSON.stringify(item));
  }
}
