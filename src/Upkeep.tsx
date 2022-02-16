import { View } from 'react-native';
import { Title } from 'react-native-paper';

import { ActionableItem } from './ActionableItem';
import { Item, Kind } from './Item';

export function nextUpkeepTask(openItems: Item[]) {
  const inbox = openItems.find(i => i.kind === Kind.INBOX);

  if (inbox != null) {
    return <ActionableItem item={inbox} />;
  }

  const itemMap = new Map();
  for (const item of openItems) {
    itemMap.set(item.id, item);
  }

  const projectMissing = openItems.find(i => isProjectMissingItem(i, itemMap));
  if (projectMissing != null) {
    return <ActionableItem item={projectMissing} />;
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
