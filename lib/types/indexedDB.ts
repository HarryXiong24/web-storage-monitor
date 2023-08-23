import { DATA_TYPE } from './index';
import { IStorage } from './storage';

export interface IIndexedDB extends IStorage {
  dbName?: string;
  storeName?: string;
}

export interface IndexedDBReport {
  dataType: DATA_TYPE;
  isBlock: true | false;
  data: IIndexedDB;
  reportDate: number;
}
