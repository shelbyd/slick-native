import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
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
    const unsub = navigation.addListener('beforeRemove', async () => {
      // TODO(shelbyd): Stop navigation until save is done.
      await store.save(item);
    });
    return unsub;
  }, [item]);

  return (
    <ScreenRoot>
      <View style={styles.container}>
        <TextInput
            label="Title"
            autoFocus={true}
            value={item.title}
            onChangeText={text => setItem({...item, title: text})} />
        <KindSelector current={item.kind} onChange={kind => setItem({...item, kind})} />
        <Parent item={item} />
        <Actions item={item} onChange={i => {
          setItem(i);
          setTimeout(() => navigation.goBack());
        }} />
      </View>
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

function Parent({ item }: { item: Item }) {
  if (item.parent == null) return null;

  const [parent, setParent] = useState(null);
  const store = useContext(StoreContext);

  useEffect(async () => {
    const loaded = await store.load(item.parent);
    setParent(loaded);
  }, [item]);

  if (parent == null) return null;

  return (
    <View style={{marginTop: 8}}>
      <Title>Parent</Title>
      <ItemInList item={parent} />
    </View>
  );
}

function Actions({ item, onChange }: { item: Item, onChange: (item: Item) => void }) {
  return (
    <View>
      <Title>Actions</Title>

      <FlatList
          data={fullActions(item)}
          style={{marginTop: 16}}
          keyExtractor={(action) => action.id}
          renderItem={({item: action}) => {
            const inner = action.render(item);
            if (inner == null) return null;

            return <View style={{marginTop: 8}}>{inner}</View>;
          }}
          />
    </View>
  );
}
