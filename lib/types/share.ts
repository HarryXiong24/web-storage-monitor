import { DATA_TYPE } from './';

export type ShareRequestType = 'image' | 'xhr' | 'beacon' | 'fetch';

export interface IShare {
  domain: string;
}

export interface IShareData {
  requestType?: ShareRequestType;
  url: string;
  domain?: string;
  pathname?: string;
  method?: string;
  [key: string]: unknown;
}

export type ShareReport = {
  dataType: DATA_TYPE.Share;
  isBlock: 0 | 1;
  data: IShareData;
};
