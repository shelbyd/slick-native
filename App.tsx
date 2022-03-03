import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { migrator, StoreContext } from './src/Injection';
import HomeScreen from './src/HomeScreen';
import ItemDetailsScreen from './src/ItemDetailsScreen';

const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#121212',
    text: '#FFFFFF',
    placeholder: '#DDDDDD',
  },
};

const Stack = createNativeStackNavigator();

const navigationScreenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  headerTintColor: theme.colors.text,
  headerRight: () => <SavingIndicator />,
};

export default function App() {
  const [migrationsDone, setMigrationsDone] = useState(false);

  useEffect(async () => {
    await migrator.perform();
    setMigrationsDone(true);
  }, []);

  if (!migrationsDone) return null;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={navigationScreenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <StatusBar style="auto" />
    </PaperProvider>
  );
}

function SavingIndicator() {
  const store = useContext(StoreContext);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sub = store.savingSubject.subscribe(count => setSaving(count > 0));
    return () => sub.unsubscribe();
  }, [store]);

  return saving ? <IconButton icon='content-save' color='white' /> : null;
}
