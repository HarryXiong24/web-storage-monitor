import { DATA_TYPE } from './index';

export interface ICookie {
  name?: string;
  httpOnly?: 0 | 1 | 2;
  secure?: 0 | 1 | 2;
  domain?: string;
  expires?: string;
  duration?: number;
  value?: string;
  originalCookie?: string;
}

export type CookieReport = {
  dataType: DATA_TYPE.Cookie;
  isBlock: true | false;
  data: ICookie;
  reportDate: number;
};
