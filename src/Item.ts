import uuid from 'react-native-uuid';

export interface Item {
  id: string,
  title: string;
  kind: Kind;
  createdAt: Date,
};

export enum Kind {
  INBOX = 'inbox',
  NEXT_ACTION = 'next_action',
  PROJECT = 'project',
  WAITING_FOR = 'waiting_for',
  SOMEDAY = 'someday',
};

export function empty(): Item {
  return {
    id: uuid.v4(),
    kind: Kind.INBOX,
    title: '',
    createdAt: new Date(),
  };
}

export function parseMigrate(json: string): [Item, boolean] {
  let mutated = false;
  const fromJson = JSON.parse(json);

  if (fromJson.createdAt == null) {
    fromJson.createdAt = new Date();
    mutated = true;
  } else {
    fromJson.createdAt = new Date(fromJson.createdAt);
  }

  return [fromJson, mutated];
}

export const KIND_DATA = {
  [Kind.INBOX]: {
    color: 'orange',
    icon: 'email',
    text: 'Inbox',
  },
  [Kind.NEXT_ACTION]: {
    color: 'green',
    icon: 'checkbox-marked',
    text: 'Next Action',
  },
  [Kind.PROJECT]: {
    color: 'yellow',
    icon: 'format-list-numbered',
    text: 'Project',
  },
  [Kind.WAITING_FOR]: {
    color: 'red',
    icon: 'clock',
    text: 'Waiting For',
  },
  [Kind.SOMEDAY]: {
    color: 'blue',
    icon: 'weather-night',
    text: 'Someday / Maybe',
  },
};
