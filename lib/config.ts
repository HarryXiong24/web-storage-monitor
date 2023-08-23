import { IConfig } from './types';

// 默认配置
const DEFAULT_CMP_CONFIG: IConfig = {
  // 各监控/拦截功能模块的开关控制
  control: {
    store: true,
    collect: true,
    share: true,
  },
  // 禁用原生各功能模块的能力
  block: {
    store: false,
    collect: false,
    share: false,
  },
  // 白名单
  whiteList: {
    cookie: [],
    storage: [],
    indexedDB: [],
    api: [],
    share: [],
  },
  // 选择报告的格式
  reportFormat: {
    consolePrint: {
      JSON: true,
      obj: true,
    },
    sendReport: {
      // 发送报告的 Api
      sendReportApi: '',
      isSend: false,
    },
  },
  // 监控的项目信息
  projectInfo: {},
  // SDK 版本
  SDKVersion: '',
};

export { DEFAULT_CMP_CONFIG };
