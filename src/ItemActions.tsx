import { Item, Kind, KIND_DATA } from './Item';
import { PickItem } from './PickItem';

export interface Action {
  title: string;
  icon: string;
  color?: string;
  applies: (item: Item) => boolean;
  perform: (item: Item) => Item;
}

const SIMPLE_ACTIONS: Action[] = [
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
    perform : ({update, item}) => update({...item, completedAt : new Date()}),
  },
];

const COMPLEX_ACTIONS: Action[] = [
  {
    title : 'Set Parent',
    icon : 'file-tree',
    color : KIND_DATA[Kind.PROJECT].color,
    applies :
        (item) => [Kind.NEXT_ACTION, Kind.WAITING_FOR, Kind.PROJECT].includes(
            item.kind),
    perform: ({item, update, render}) => {
      const setParent = (project) => {
        if (project == null) return render(null);

        update(
          {...item, parent: project.id},
          [{...project, children: [...project.children, item.id]}]
        );
      };

      render(
        <PickItem
            filter={(i) => i.kind === Kind.PROJECT && i.id !== item.parent}
            onSelected={setParent} />
      );
    }
  },
];

export function fullActions(item: Item) {
  return [...SIMPLE_ACTIONS, ...COMPLEX_ACTIONS].filter(action => action.applies(item));
}

export function simpleActions(item: Item) {
  return SIMPLE_ACTIONS.filter(action => action.applies(item));
}
