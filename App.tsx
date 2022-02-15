import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
};

export default function App() {
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
