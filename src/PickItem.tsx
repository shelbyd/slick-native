import { useEffect, useState, useContext } from 'react';
import { FlatList } from 'react-native';

import { StoreContext } from './Injection';
import { Item } from './Item';
import { ItemInList } from './ItemInList';

export function PickItem({filter, onSelected}: {filter: (item: Item) => boolean, onSelected: (item: Item|null) => void}) {
  const [items, setItems] = useState(null);
  const store = useContext(StoreContext);

  useEffect(() => {
    const subscription = store.openItems().subscribe(items => {
      items = items.filter(filter);
      setItems(items);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (items == null) {
    return null;
  }

  if (items.length === 0) {
    setTimeout(() => onSelected(null));
    return null;
  }

  return (
    <FlatList
        data={items}
        renderItem={({item}) =>
          <ItemInList
              item={item}
              onPress={() => onSelected(item)}
          />}
    />
  );
}
