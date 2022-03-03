import { useContext, useState } from 'react';
import { View } from 'react-native';
import { useTheme, Button, Portal, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { StoreContext } from './Injection';
import { empty, timePlusDuration, Item, Kind, KIND_DATA, ONE_HOUR } from './Item';
import { PickItem } from './PickItem';

export interface Action {
  title: string;
  icon: string;
  color?: string;
  applies: (item: Item) => boolean;
  perform: (actions: {
    item: Item,
    update: (primary: Item, additional: Item[]) => void,
    render: (component: any) => void,
    navigationPush: (...args: any[]) => void,
  }) => Item;
}

export function fullActions(item: Item) {
  return [
    ...simpleActions(item),
    {
      id: 'set-parent',
      render: (item) => {
        if (![Kind.NEXT_ACTION, Kind.WAITING_FOR, Kind.PROJECT].includes(item.kind)) return null;

        return (
          <ActionButton
              text='Set Parent'
              icon='file-tree'
              color='yellow'
              onPress={async ({store, renderModal}) => {
                renderModal(
                  <PickItem
                      filter={(i) => i.kind === Kind.PROJECT && i.id !== item.parent}
                      onSelected={async (project) => {
                        if (project == null) return;

                        await store.save({...item, parent: project.id});
                        renderModal(null);
                      }} />
                );
              }} />
        );
      },
    },
    {
      id: 'clear-parent',
      render: (item) => {
        if (item.parent == null) return null;

        return (
          <ActionButton text='Clear Parent' icon='file-tree' color='yellow' onPress={async ({store}) => {
            await store.save({...item, parent: null});
          }}/>
        );
      },
    },
    {
      id: 'add-blocker',
      render: (item) => {
        if (item.completedAt != null) return null;

        return (
          <ActionButton
              text='Add Blocker'
              icon='cancel'
              color='orange'
              onPress={async ({store, renderModal}) => {
                renderModal(
                  <PickItem
                      filter={(i) => {
                        const validType = [Kind.PROJECT, Kind.NEXT_ACTION, Kind.WAITING_FOR].includes(i.kind);
                        const already = item.blockers.includes(i.id);
                        const completed = i.completedAt != null;
                        return validType && !already && !completed;
                      }}
                      onSelected={async (blocker) => {
                        if (blocker == null) return;

                        await store.save({...item, blockers: [...item.blockers, blocker.id]});
                        renderModal(null);
                      }} />
                );
              }} />
        );
      }
    },
    {
      id: 'delete',
      render: (item) => {
        return (
          <ActionButton text='Delete' icon='delete' color='red' onPress={async ({store}) => {
            await store.delete(item.id);
          }}/>
        );
      },
    },
  ];
}

export function simpleActions(item: Item) {
  return [
    {
      id: 'complete',
      render: (item: Item) => {
        if (item.completedAt != null) return null;

        const completable = [Kind.NEXT_ACTION, Kind.INBOX, Kind.WAITING_FOR, Kind.PROJECT].includes(item.kind);
        if (!completable) return null;

        return (
          <ActionButton text='Complete' icon='check' color='green' onPress={async ({store}) => {
            await store.save({...item, completedAt: new Date()});
          }}/>
        );
      },
    },
    {
      id: 'snooze-1h',
      render: () => {
        if (item.completedAt != null) return null;
        if (item.snoozedUntil > new Date()) return null;
        if (![Kind.NEXT_ACTION, Kind.WAITING_FOR].includes(item.kind)) return null;

        return (
          <ActionButton text='Snooze 1h' icon='alarm-snooze' color='blue' onPress={async ({store}) => {
            await store.save({...item, snoozedUntil: timePlusDuration(ONE_HOUR)});
          }}/>
        );
      },
    },
    {
      id: 'snooze-20h',
      render: () => {
        if (item.completedAt != null) return null;
        if (item.snoozedUntil > new Date()) return null;
        if (![Kind.NEXT_ACTION, Kind.WAITING_FOR].includes(item.kind)) return null;

        return (
          <ActionButton text='Snooze 20h' icon='alarm-snooze' color='blue' onPress={async ({store}) => {
            await store.save({...item, snoozedUntil: timePlusDuration(20 * ONE_HOUR)});
          }}/>
        );
      },
    },
    {
      id: 'snooze-7d',
      render: () => {
        if (item.completedAt != null) return null;
        if (item.snoozedUntil > new Date()) return null;
        if (![Kind.SOMEDAY].includes(item.kind)) return null;

        return (
          <ActionButton text='Snooze 7 days' icon='alarm-snooze' color='blue' onPress={async ({store}) => {
            const hours = 7 * 24 - 4;
            await store.save({...item, snoozedUntil: timePlusDuration(hours * ONE_HOUR)});
          }}/>
        );
      },
    },
    {
      id: 'add-child',
      render: () => {
        if (item.completedAt != null) return null;
        if (![Kind.PROJECT].includes(item.kind)) return null;

        return (
          <ActionButton text='Add Child' icon='file-tree' color='yellow' onPress={({navigation}) => {
            const newItem = empty();
            newItem.kind = Kind.NEXT_ACTION;
            newItem.parent = item.id;
            navigation.push('ItemDetails', {item: newItem});
          }}/>
        );
      },
    },
  ];
}

function ActionButton({icon, color, text, onPress}) {
  const store = useContext(StoreContext);
  const navigation = useNavigation();

  const theme = useTheme();
  const [modal, setModal] = useState(null);
  const renderModal = (content) => setModal(content);

  const containerStyle = {
    backgroundColor: theme.colors.background,
    padding: 16,
    margin: 16,
  };

  return (
    <View>
      <Portal>
        <Modal
            visible={modal != null}
            onDismiss={() => setModal(null)}
            contentContainerStyle={containerStyle}>
          {modal}
        </Modal>
      </Portal>

      <Button
          icon={icon}
          color={color}
          mode='contained'
          onPress={() => onPress({store, navigation, renderModal})}
          >
        {text}
      </Button>
    </View>
  );
}
