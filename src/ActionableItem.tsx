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

  const desc = KIND_DATA[item.kind];

  return (
    <View style={{padding: 16}}>
      <TouchableOpacity
          style={{marginBottom: 8}}
          onPress={() => navigation.push('ItemDetails', {item})}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar.Icon
              icon={desc.icon}
              style={{marginRight: 16, backgroundColor: desc.color}} />
          <Title style={{flex: 1}}>{item.title}</Title>
        </View>
      </TouchableOpacity>

      {item.kind === Kind.INBOX ?
          <View>
            <KindSelector current={item.kind} onChange={(kind) => store.save({...item, kind})} />
          </View> :
          null}

      {simpleActions(item).map(action => {
        const inner = action.render(item);
        if (inner == null) return null;

        return <View key={action.id} style={{marginTop: 8}}>{inner}</View>;
      })}
    </View>
  );
}
