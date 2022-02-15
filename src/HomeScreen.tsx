import { FAB, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { ScreenRoot, CenterContent } from './UiUtils';

export default function HomeScreen({ navigation }) {
  return (
    <ScreenRoot>
      <CenterContent>
        <Text>Open up App.tsx to start working on your app!</Text>
        <FAB style={styles.fab} icon="plus" onPress={() => {
          navigation.navigate('ItemDetails');
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
