import { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { StoreContext } from './Injection';
import { empty } from './Item';
import { CenterContent, ScreenRoot } from './UiUtils';

export default function ItemDetailsScreen() {
  const [item, setItem] = useState(empty());
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
    <TextInput label="Title" value={item.title} onChangeText={text => setItem({...item, title: text})} />
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
