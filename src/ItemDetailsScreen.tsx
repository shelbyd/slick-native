import { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { StoreContext } from './Injection';
import { empty, Kind, KIND_DATA } from './Item';
import { CenterContent, ScreenRoot } from './UiUtils';

export default function ItemDetailsScreen({ route }) {
  const [item, setItem] = useState(route.params.item || empty());
  const store = useContext(StoreContext);

  useEffect(() => {
    return async () => {
      // TODO(shelbyd): This saves every time anything changes.
      // Make it only change when navigating away.
      await store.save(item);
    };
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
      </View>
    </ScreenRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',

    padding: 8,
  },
});

function KindSelector({current, onChange}: { current: Kind, onChange: (kind: Kind) => void }) {
  const style = {
    flex: 1,
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
