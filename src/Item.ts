import uuid from 'react-native-uuid';

export interface Item {
  id: string,
  title: string;
  kind: Kind;
  createdAt: Date,
};

export enum Kind {
  INBOX = 'inbox',
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
