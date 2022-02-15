import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text, List } from 'react-native-paper';

import { empty, Kind, KIND_DATA } from './Item';
import { ItemInList } from './ItemInList';
import { StoreContext } from './Injection';
import { ScreenRoot, CenterContent } from './UiUtils';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const store = useContext(StoreContext);

  useEffect(() => {
    const subscription = store.openItems().subscribe(items => {
      items = items.filter(i => i.completedAt == null);
      items.sort((a, b) => a.createdAt - b.createdAt);
      setItems(items);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ScreenRoot>
      <CenterContent>
        <FlatList
            style={{alignSelf: 'stretch'}}
            data={items}
            renderItem={({item}) =>
              <ItemInList
                  item={item}
                  onPress={() => navigation.push('ItemDetails', {item})}
              />}
        />

        <FAB style={styles.fab} icon="plus" onPress={() => {
          navigation.push('ItemDetails', {item: empty()});
        }} />
      </CenterContent>
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
