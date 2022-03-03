import { MockStorage } from './MockStorage';
import { DagStorage } from './DagStorage';

describe('DagStorage', () => {
  let storage;
  let dag;

  beforeEach(() => {
    storage = new MockStorage();
    dag = new DagStorage(storage);
  });

  it('is empty to begin', async () => {
    expect(await dag.incoming('foo')).toEqual([]);
    expect(await dag.outgoing('foo')).toEqual([]);
  });

  describe('setIncoming', () => {
    it('returns incoming', async () => {
      await dag.setIncoming('foo', ['bar']);

      expect(await dag.incoming('foo')).toEqual(['bar']);
    });

    it('returns outgoing', async () => {
      await dag.setIncoming('foo', ['bar']);

      expect(await dag.outgoing('bar')).toEqual(['foo']);
    });

    it('from the same source', async () => {
      await dag.setIncoming('bar', ['foo']);
      await dag.setIncoming('baz', ['foo']);

      expect(await dag.outgoing('foo')).toEqual(['bar', 'baz']);
    });

    it('resetting empty incoming', async () => {
      await dag.setIncoming('bar', ['foo']);
      await dag.setIncoming('bar', []);

      expect(await dag.outgoing('foo')).toEqual([]);
    });

    it('only adds once', async () => {
      await dag.setIncoming('bar', ['foo']);
      await dag.setIncoming('bar', ['foo']);

      expect(await dag.incoming('bar')).toEqual(['foo']);
    });

    it('maintains order', async () => {
      await dag.setIncoming('bar', ['foo']);
      await dag.setIncoming('baz', ['foo']);
      await dag.setIncoming('qux', ['foo']);

      expect(await dag.outgoing('foo')).toEqual(['bar', 'baz', 'qux']);
    });
  });

  describe('delete', () => {
    it('removes incoming', async () => {
      await dag.setIncoming('bar', ['foo']);
      await dag.delete('bar');

      expect(await dag.incoming('bar')).toEqual([]);
    });

    it('removes outgoing', async () => {
      await dag.setOutgoing('bar', ['foo']);
      await dag.delete('bar');

      expect(await dag.outgoing('bar')).toEqual([]);
    });

    it('removes reverse outgoing links', async () => {
      await dag.setIncoming('bar', ['foo']);
      await dag.delete('bar');

      expect(await dag.outgoing('foo')).toEqual([]);
    });

    it('actually removes items', async () => {
      await dag.setIncoming('bar', ['foo']);
      await dag.delete('bar');

      expect(await storage.getAllKeys()).toEqual([]);
    });
  });
});
