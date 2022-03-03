import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { Item, KIND_DATA } from './Item';

export function ItemInList({ item, onPress }: { item: Item, onPress: () => void }) {
  const kindDesc = KIND_DATA[item.kind];
  let maybeNavigate = () => {};

  try {
    const navigation = useNavigation();

    maybeNavigate = () => {
      navigation.push('ItemDetails', {item: item});
    };
  } catch (e) {}

  return (
    <List.Item
        title={item.title}
        key={item.id}
        left={props => <List.Icon {...props} color={kindDesc.color} icon={kindDesc.icon} />}
        onPress={onPress || maybeNavigate} />
  );
}
