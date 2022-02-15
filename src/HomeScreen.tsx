import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text, List } from 'react-native-paper';

import { empty, Kind, KIND_DATA } from './Item';
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

  const renderListItem = ({item}) => {
    const kindDesc = KIND_DATA[item.kind];

    return (
      <List.Item
          title={item.title}
          key={item.id}
          left={props => <List.Icon {...props} color={kindDesc.color} icon={kindDesc.icon} />}
          onPress={() => navigation.navigate('ItemDetails', {item})}/>
    );
  };

  return (
    <ScreenRoot>
      <CenterContent>
        <FlatList
            style={{alignSelf: 'stretch'}}
            data={items}
            renderItem={renderListItem} />

        <FAB style={styles.fab} icon="plus" onPress={() => {
          navigation.navigate('ItemDetails', {item: empty()});
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
