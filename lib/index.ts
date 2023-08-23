import { DEFAULT_CMP_CONFIG } from './config';
import DataCollect from './dataCollect';
import DataShare from './dataShare';
import DataStore from './dataStore';
import { IConfig, IReport } from './types';

export default class Monitor {
  // 配置项
  config: IConfig = DEFAULT_CMP_CONFIG;
  // 汇报数据
  reportData: IReport[] = [];
  dataStore: DataStore | undefined;
  dataCollect: DataCollect | undefined;
  dataShare: DataShare | undefined;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  private nativeSendBeacon = Navigator.prototype.sendBeacon;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  private nativeXHRSend = window.XMLHttpRequest.prototype.send;

  constructor(config: Partial<IConfig>) {
    try {
      // 执行 report 方法
      this.report = this.report.bind(this);
      // 覆盖配置
      this.coverConfig(config);
      // 初始化功能
      this.init();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @param {IConfig} config
   * @return {*}
   * @description: 覆盖默认配置
   */
  coverConfig(config: Partial<IConfig>) {
    if (config) {
      this.config = Object.assign({}, DEFAULT_CMP_CONFIG, config);
    }
  }

  /**
   * @return {*}
   * @description: 发送上报数据
   */
  sendReportData() {
    if (this.reportData.length === 0) {
      return;
    }
    const { reportFormat, projectInfo, SDKVersion } = this.config;
    const { consolePrint, sendReport } = reportFormat;

    if (consolePrint) {
      if (consolePrint.JSON) {
        const reportContent = JSON.stringify({
          reportList: this.reportData,
          SDKVersion,
          projectInfo,
        });
        console.log('Monitor: ', reportContent);
      }
      if (consolePrint.obj) {
        const reportContent = {
          reportList: this.reportData,
          SDKVersion,
          projectInfo,
        };
        console.log('Monitor: ', reportContent);
      }
    }

    if (sendReport && sendReport.isSend) {
      const { sendReportApi } = sendReport;
      const reportContent = JSON.stringify({
        reportList: this.reportData,
        SDKVersion,
        projectInfo,
      });
      // Share 模块劫持 sendBeacon/xhr，这里调用原生的方法避免产生 loop，可以考虑其他方式, 不希望这个模块感知其他模块的逻辑。
      if (this.nativeSendBeacon) {
        this.nativeSendBeacon.call(navigator, sendReportApi, reportContent);
      } else if (this.nativeXHRSend) {
        const xhr = new XMLHttpRequest();
        xhr.open('post', sendReportApi);
        this.nativeXHRSend.call(xhr, reportContent);
      }
    }

    this.reportData = [];
  }

  report(data: IReport | IReport[]) {
    if (!data) {
      return;
    }

    if (!Array.isArray(data)) {
      data = [data];
    }

    this.reportData.push(...data);
    this.sendReportData();
  }

  init() {
    const { block, control, whiteList } = this.config;
    const report = this.report.bind(this);
    if (control?.store) {
      this.dataStore = new DataStore(
        block.store,
        whiteList.cookie || [],
        whiteList.storage || [],
        whiteList.indexedDB || [],
        report
      );
    }

    if (control?.collect) {
      this.dataCollect = new DataCollect(block.collect, whiteList.api, report);
    }

    if (control?.share) {
      this.dataShare = new DataShare(block.share, whiteList.share, report);
    }
  }
}
