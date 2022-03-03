import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Store } from './storage/Store';
import { Migrator } from './storage/Migrator';

const store = new Store(AsyncStorage);
export const StoreContext = createContext(store);

export const migrator = new Migrator(AsyncStorage);
