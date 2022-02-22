import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Divider, FAB, Text, Title, List } from 'react-native-paper';

import { ActionableItem } from './ActionableItem';
import { empty, Kind, KIND_DATA } from './Item';
import { simpleActions } from './ItemActions';
import { ItemInList } from './ItemInList';
import { StoreContext } from './Injection';
import { nextUpkeepTask } from './Upkeep';
import { ScreenRoot, CenterContent } from './UiUtils';

function useForceRender() {
  const [count, setCount] = useState(0);
  return () => setCount(count + 1);
}

export default function HomeScreen({ navigation }) {
  const [openItems, setOpenItems] = useState([]);
  const store = useContext(StoreContext);

  useEffect(() => {
    const subscription = store.openItems().subscribe(items => {
      items = items.filter(i => i.completedAt == null);
      items.sort((a, b) => a.createdAt - b.createdAt);
      setOpenItems(items);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isActionable = (i) =>
    [Kind.NEXT_ACTION, Kind.WAITING_FOR, Kind.SOMEDAY].includes(i.kind);

  const forceRender = useForceRender();
  useEffect(() => {
    const unsnoozes = openItems
      .filter(isActionable)
      .filter(i => i.snoozedUntil > new Date())
      .map(i => i.snoozedUntil);
    const nextUnsnooze = new Date(Math.min(...unsnoozes));

    const delay = nextUnsnooze.getTime() - new Date().getTime();
    if (isNaN(delay)) return;

    const timeout = setTimeout(forceRender, delay);
    return () => clearTimeout(timeout);
  }, [openItems]);

  const nextAction = openItems
      .filter(i => i.snoozedUntil == null || i.snoozedUntil <= new Date())
      .filter(isActionable)[0];

  const navigateTo = (item) => () => navigation.push('ItemDetails', {item});

  return (
    <ScreenRoot>
      <View style={{flex: 1, alignItems: 'stretch'}}>
        {nextAction == null ? null : <ActionableItem item={nextAction} />}
        <Divider style={{flex: 0}} />
        {nextUpkeepTask(openItems)}
        <Divider style={{flex: 0}} />
        <FlatList
            style={{flex: 1}}
            data={openItems}
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
