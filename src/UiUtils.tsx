import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

export function ScreenRoot({ children }) {
  const { colors } = useTheme();

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      {children}
    </View>
  );
}

export function CenterContent({ children }) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
