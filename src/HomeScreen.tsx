import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Divider, FAB, Text, Title, List } from 'react-native-paper';

import { empty, Kind, KIND_DATA } from './Item';
import { simpleActions } from './ItemActions';
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

  const nextAction = items.filter(i => i.kind == Kind.NEXT_ACTION)[0];

  const navigateTo = (item) => () => navigation.push('ItemDetails', {item});

  return (
    <ScreenRoot>
      <View style={{flex: 1, alignItems: 'stretch'}}>
        {nextAction == null ? null : <RichItem item={nextAction} onPress={navigateTo(nextAction)}/>}
        <Divider style={{flex: 0}} />
        <FlatList
            style={{flex: 1}}
            data={items}
            renderItem={({item}) =>
              <ItemInList item={item} key={item.id} onPress={navigateTo(item)} />
            } />
      </View>

      <FAB style={styles.fab} icon="plus" onPress={navigateTo(empty())} />
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

function RichItem({ item, onPress }: { item: Item, onPress: () => void }) {
  const store = useContext(StoreContext);

  const actions = simpleActions(item);

  return (
    <View style={{padding: 16}}>
      <TouchableOpacity onPress={onPress}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar.Icon
              icon={KIND_DATA[Kind.NEXT_ACTION].icon}
              style={{marginRight: 16, backgroundColor: KIND_DATA[Kind.NEXT_ACTION].color}} />
          <Title>{item.title}</Title>
        </View>
      </TouchableOpacity>

      <FlatList
          data={actions}
          style={{marginTop: 16}}
          keyExtractor={(action) => action.title}
          renderItem={({item: action}) => {
            return (
              <Button
                  icon={action.icon}
                  mode="contained"
                  color={action.color}
                  style={{marginTop: 8}}
                  onPress={() => {
                    action.perform({
                      item,
                      update: async (primary, additional) => {
                        for (const item of (additional || [])) {
                          await store.save(item);
                        }
                        await store.save(primary);
                      },
                    });
                  }}>
                {action.title}
              </Button>
            );
          }}/>
    </View>
  );
}
