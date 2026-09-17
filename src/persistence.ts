import { emptyStore, type Store } from './domain';
const KEY = 'chapterprep.store.v1';
export interface StoreRepository {
  load(): Store;
  save(store: Store): void;
}
export class LocalStorageRepository implements StoreRepository {
  load(): Store {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...emptyStore, ...JSON.parse(raw) } : emptyStore;
    } catch {
      return emptyStore;
    }
  }
  save(store: Store) {
    localStorage.setItem(KEY, JSON.stringify(store));
  }
}
