import { DATA_TYPE, StorageType } from './index';

export interface IStorage {
  name?: string;
  duration?: number;
  value?: string;
  type?: StorageType;
}

export type StorageReport = {
  dataType: DATA_TYPE.Storage;
  isBlock: true | false;
  data: IStorage;
  reportDate: number;
};
