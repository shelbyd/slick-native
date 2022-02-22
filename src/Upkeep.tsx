import { View } from 'react-native';
import { Title } from 'react-native-paper';

import { ActionableItem } from './ActionableItem';
import { Item, Kind } from './Item';

export function nextUpkeepTask(openItems: Item[]) {
  const itemMap = new Map();
  for (const item of openItems) {
    itemMap.set(item.id, item);
  }

  const itemGetters = [
    () => openItems.find(i => i.kind === Kind.INBOX),
    () => openItems.find(i => isProjectMissingItem(i, itemMap)),
  ];

  for (const getter of itemGetters) {
    const item = getter();
    if (item != null) {
      return <ActionableItem item={item} />;
    }
  }

  return null;
}

function isProjectMissingItem(project: Item, openItemMap: Map<string, Item>): boolean {
  if (project.kind !== Kind.PROJECT) return false;

  const hasOpen = project
      .children
      .map(childId => openItemMap.get(childId))
      .filter(child => child != null)
      .some(child => [Kind.NEXT_ACTION, Kind.WAITING_FOR, Kind.PROJECT].includes(child.kind));
  return !hasOpen;
}
