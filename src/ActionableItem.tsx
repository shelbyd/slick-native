import { useContext } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Title } from 'react-native-paper';
import { NavigationContext } from '@react-navigation/native';

import { Kind, KIND_DATA } from './Item';
import { KindSelector } from './ItemDetailsScreen';
import { simpleActions } from './ItemActions';
import { StoreContext } from './Injection';

export function ActionableItem({ item }: { item: Item }) {
  const store = useContext(StoreContext);
  const navigation = useContext(NavigationContext);

  const actions = simpleActions(item);
  const desc = KIND_DATA[item.kind];

  return (
    <View style={{padding: 16}}>
      <TouchableOpacity onPress={() => navigation.push('ItemDetails', {item})}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar.Icon
              icon={desc.icon}
              style={{marginRight: 16, backgroundColor: desc.color}} />
          <Title>{item.title}</Title>
        </View>
      </TouchableOpacity>

      {item.kind === Kind.INBOX ?
          <View style={{marginTop: 16}}>
            <KindSelector current={item.kind} onChange={(kind) => store.save({...item, kind})} />
          </View> :
          null}

      <FlatList
          data={actions}
          style={{marginTop: 16}}
          keyExtractor={(action) => action.title}
          renderItem={({item: action}) => {
            return (
              <Button
                  icon={action.icon}
                  mode="contained"
                  color={action.color}
                  style={{marginTop: 8}}
                  onPress={() => {
                    action.perform({
                      item,
                      update: async (primary, additional) => {
                        for (const item of (additional || [])) {
                          await store.save(item);
                        }
                        await store.save(primary);
                      },
                      navigationPush: (...args) => navigation.push(...args),
                    });
                  }}>
                {action.title}
              </Button>
            );
          }}/>
    </View>
  );
}
