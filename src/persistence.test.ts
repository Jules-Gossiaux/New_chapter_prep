import { describe, expect, it, beforeEach } from 'vitest';
import { LocalStorageRepository } from './persistence';
describe('local persistence', () => {
  beforeEach(() => localStorage.clear());
  it('reloads stored data', () => {
    const repo = new LocalStorageRepository();
    const value = { books: [{ id: 'b' }], chapters: [{ id: 'c' }] } as never;
    repo.save(value);
    expect(repo.load()).toEqual(value);
  });
  it('recovers from corrupt storage', () => {
    localStorage.setItem('chapterprep.store.v1', '{bad');
    expect(new LocalStorageRepository().load()).toEqual({
      books: [],
      chapters: [],
    });
  });
});
