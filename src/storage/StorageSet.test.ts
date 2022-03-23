import {MockStorage} from './MockStorage';
import {StorageSet} from './StorageSet';

describe('StorageSet', () => {
  let storage;
  let set;

  beforeEach(() => {
    storage = new MockStorage();
    set = new StorageSet(storage);
  });

  it('starts empty',
     async () => { expect(await set.allValues()).toEqual([]); });

  it('contains item after insert', async () => {
    await set.insert('foo')

    expect(await set.allValues()).toEqual([ 'foo' ]);
  });

  it('contains item after insert', async () => {
    await set.insert('foo');
    await set.insert('bar');
    await set.insert('baz');

    expect(new Set(await set.allValues()))
        .toEqual(new Set([ 'foo', 'bar', 'baz' ]));
  });

  it('does not double insert', async () => {
    await set.insert('foo');
    await set.insert('foo');

    expect(await set.allValues()).toEqual([ 'foo' ]);
  });

  it('removes item', async () => {
    await set.insert('foo');
    await set.remove('foo');

    expect(await set.allValues()).toEqual([]);
  });

  it('does not accrue keys', async () => {
    await set.insert('foo');
    await set.insert('bar');
    await set.remove('bar');

    const len = (await storage.getAllKeys()).length;

    await set.insert('baz');
    await set.remove('baz');

    const newLen = (await storage.getAllKeys()).length;

    // console.log('await storage.getAllKeys()', await storage.getAllKeys());
    // console.log('storage.map', storage.map);
    // storage.map.delete('values/baz');
    // console.log('storage.map', storage.map);

    expect(newLen).toEqual(len);
  });
});
