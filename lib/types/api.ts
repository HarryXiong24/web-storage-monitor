import { DATA_TYPE, MatchMode } from '.';

export interface TMatchUrl {
  type: MatchMode;
  url: string;
}

export interface IApi {
  name?: string;
  name_id?: string;
  value?: any;
  limit?: number;
  frequency?: number;
  matchUrl?: TMatchUrl[];
}

export type ApiReport = {
  dataType: DATA_TYPE.Api;
  isBlock: 0 | 1;
  data: IApi;
  reportDate: number;
};
