import uuid from 'react-native-uuid';

export interface Item {
  id: string,
  title: string;
  kind: Kind;
};

export enum Kind {
  INBOX = 'inbox',
};

export function empty(): Item {
  return {
    id: uuid.v4(),
    kind: Kind.INBOX,
    title: '',
  };
}
