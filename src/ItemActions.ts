import {Item, Kind} from './Item';

export interface Action {
  title: string;
  icon: string;
  color?: string;
  applies: (item: Item) => boolean;
  perform: (item: Item) => Item;
}

const ALL_ACTIONS = [
  {
    title : 'Complete',
    icon : 'check',
    color : 'green',
    applies : (item) => {
      if (item.completedAt != null)
        return false;
      return [
        Kind.NEXT_ACTION,
        Kind.INBOX,
        Kind.WAITING_FOR,
        Kind.PROJECT,
      ].includes(item.kind);
    },
    perform : (item) => ({...item, completedAt : new Date()}),
  },
];

export function itemActions(item: Item) {
  return ALL_ACTIONS.filter(action => action.applies(item));
}
