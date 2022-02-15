import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Store } from './Store';

const store = new Store(AsyncStorage);
export const StoreContext = createContext(store);
