import uuid from 'react-native-uuid';

export type ItemId = string;

export interface Item {
  id: ItemId,
  title: string;
  kind: Kind;
  createdAt: Date;
  completedAt?: Date;
  parent?: ItemId;
  children: ItemId[];
  snoozedUntil?: Date;
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
    parent: null,
    children: [],
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

  if (fromJson.completedAt != null) {
    fromJson.completedAt = new Date(fromJson.completedAt);
  }

  if (fromJson.snoozedUntil != null) {
    fromJson.snoozedUntil = new Date(fromJson.snoozedUntil);
  }

  if (fromJson.children == null) {
    fromJson.children = [];
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

export const ONE_HOUR = 60 * 60 * 1000;

export function timePlusDuration(ms: number): Date {
  return new Date(new Date().getTime() + ms);
}

