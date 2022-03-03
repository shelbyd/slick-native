import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, ScrollView, View } from 'react-native';
import { useTheme, Button, Modal, Portal, Text, TextInput, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { StoreContext } from './Injection';
import { empty, Kind, KIND_DATA } from './Item';
import { ItemInList } from './ItemInList';
import { fullActions } from './ItemActions';
import { CenterContent, ScreenRoot } from './UiUtils';

export default function ItemDetailsScreen({ route, navigation }) {
  const [item, setItem] = useState(route.params.item || empty());
  const store = useContext(StoreContext);

  useEffect(() => {
    if (item == null) return;

    const unsub = navigation.addListener('beforeRemove', async () => {
      // TODO(shelbyd): Stop navigation until save is done.
      await store.save(item);
    });

    return unsub;
  }, [item]);

  useEffect(() => {
    const sub = store.watch(item?.id).subscribe(setItem);
    return () => sub.unsubscribe();
  }, [item?.id]);

  if (item == null) {
    setTimeout(() => navigation.goBack());
    return null;
  }

  return (
    <ScreenRoot>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
            label="Title"
            autoFocus={item.title == ''}
            value={item.title}
            onChangeText={text => setItem({...item, title: text})}
            key="title"/>
        <KindSelector current={item.kind} onChange={kind => setItem({...item, kind})} key="kind-selector" />

        <Actions item={item} onChange={i => {
          setItem(i);
          setTimeout(() => navigation.goBack());
        }} key="actions" />

        <ItemList items={item.parent == null ? [] : [item.parent]} title="Parent" key="parent" />
        <ItemList items={item.blockers} title="Blockers" key="blockers" />
        <ItemList items={item.blocking} title="Blocking" key="blocking" />
        <ItemList items={item.children} title="Children" key="children" />
      </ScrollView>
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',

    padding: 8,
  },
});

export function KindSelector({current, onChange}: { current: Kind, onChange: (kind: Kind) => void }) {
  const style = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
  };

  return (
    <View style={style}>
    {
      Object.entries(KIND_DATA).map(([kind, desc]) => {
        return (
          <Button
              key={kind}
              color={desc.color}
              mode={kind === current ? 'contained' : 'outlined'}
              style={{marginLeft: 4, marginRight: 4, marginTop: 8}}
              onPress={() => onChange(kind)}>
            {desc.text}
          </Button>
        );
      })
    }
    </View>
  );
}

function ItemList({ items, title }: { items: ItemId[], title: string }) {
  const [itemMap, setItemMap] = useState(new Map());
  const store = useContext(StoreContext);

  useEffect(async () => {
    const map = new Map();
    for (const id of items) {
      const item = await store.load(id);
      map.set(id, item);
    }
    setItemMap(map);
  }, [items]);

  if (itemMap.size == 0) return null;

  return (
    <View style={{marginTop: 8}}>
      <Title>{title}</Title>
      {
        items
          .map(i => itemMap.get(i))
          .filter(i => i != null)
          .map(i => <ItemInList item={i} key={i.id} />)}
    </View>
  );
}

function Actions({ item, onChange }: { item: Item, onChange: (item: Item) => void }) {
  return (
    <View>
      <Title>Actions</Title>

      {fullActions(item).map(action => {
        const inner = action.render(item);
        if (inner == null) return null;

        return <View style={{marginTop: 8}}>{inner}</View>;
      })}
    </View>
  );
}
