import { CookieReport, ICookie } from './cookie';
import { IStorage, StorageReport } from './storage';
import { IIndexedDB, IndexedDBReport } from './indexedDB';
import { ApiReport, IApi, TMatchUrl } from './api';
import { ShareReport, IShareData, ShareRequestType, IShare } from './share';

export interface IConfig {
  // 各监控/拦截功能模块的开关控制
  control: {
    store: boolean;
    collect: boolean;
    share: boolean;
  };
  // 禁用各功能模块的能力
  block: {
    store: boolean;
    collect: boolean;
    share: boolean;
  };
  // 白名单
  whiteList: {
    storage: IStorage[];
    cookie: ICookie[];
    indexedDB: IIndexedDB[];
    api: IApi[];
    share: IShareData[];
  };
  // 选择报告的格式
  reportFormat: {
    // 控制台
    consolePrint?: {
      JSON: boolean;
      obj: boolean;
    };
    // 发送报告给后台
    sendReport?: {
      // 发送报告的 Api
      sendReportApi: string;
      isSend: boolean;
    };
  };
  projectInfo?: Record<string, any>;
  SDKVersion?: string;
}

export type IReport =
  | StorageReport
  | CookieReport
  | IndexedDBReport
  | ApiReport
  | ShareReport;

export enum DATA_TYPE {
  Cookie = 'cookie',
  Storage = 'storage',
  IndexedDB = 'indexedDB',
  Api = 'api',
  Share = 'share',
}

export enum Duration {
  Session = 1,
  Persistent = 2,
}

export enum StorageType {
  LocalStorage = 'localStorage',
  SessionStorage = 'sessionStorage',
}

export enum MatchMode {
  Exact = 1, // 完全匹配
  Prefix = 2, // 前缀匹配
}

export enum ApiMethodType {
  GetPosition = '1',
  WatchPostion = '2',
  ReadText = '3',
  Read = '4',
  WriteText = '5',
  Write = '6',
  GetMedia = '7',
}

export const DefaultApiFrequency = {
  [ApiMethodType.GetPosition]: {
    timeStamp: 0,
    reqCount: 0,
  },
  [ApiMethodType.WatchPostion]: {
    timeStamp: 0,
    reqCount: 0,
  },
  [ApiMethodType.ReadText]: {
    timeStamp: 0,
    reqCount: 0,
  },
  [ApiMethodType.Read]: {
    timeStamp: 0,
    reqCount: 0,
  },
  [ApiMethodType.WriteText]: {
    timeStamp: 0,
    reqCount: 0,
  },
  [ApiMethodType.Write]: {
    timeStamp: 0,
    reqCount: 0,
  },
  [ApiMethodType.GetMedia]: {
    timeStamp: 0,
    reqCount: 0,
  },
};

export const ApiMethodText = {
  [ApiMethodType.GetPosition]: 'getCurrentPosition',
  [ApiMethodType.WatchPostion]: 'watchPosition',
  [ApiMethodType.ReadText]: 'readText',
  [ApiMethodType.Read]: 'read',
  [ApiMethodType.WriteText]: 'writeText',
  [ApiMethodType.Write]: 'write',
  [ApiMethodType.GetMedia]: 'getUserMedia',
};

export type {
  IStorage,
  StorageReport,
  CookieReport,
  ICookie,
  IIndexedDB,
  IndexedDBReport,
  IApi,
  ApiReport,
  TMatchUrl,
  IShare,
  IShareData,
  ShareReport,
  ShareRequestType,
};
