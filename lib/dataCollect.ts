import {
  DATA_TYPE,
  ApiMethodType,
  DefaultApiFrequency,
  ApiMethodText,
  IReport,
  IApi,
} from './types';
import {
  isApiWhitelist,
  hasApiReport,
  errorToBlock,
  isApiAllowUrl,
} from './utils/dataCollectUtils';
import { getNowTime, blockModeWarning } from './utils/general';

export default class DataCollect {
  private apiFrequency = DefaultApiFrequency;
  private isBlock = false;
  private apiWhitelist: IApi[] = [];
  private reportData: IReport[] = [];
  private report: (value: IReport) => void;

  constructor(
    isBlock: boolean,
    apiWhitelist: IApi[],
    report: (value: IReport) => void
  ) {
    this.isBlock = isBlock;
    this.apiWhitelist = apiWhitelist;
    this.report = report;
    this.setGeolocationHook();
    this.setClipboardHook();
    this.setMediaDevicesHook();
  }

  private setGeolocationHook() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    if (window.Geolocation) {
      const _getCurrentPosition =
        // eslint-disable-next-line @typescript-eslint/unbound-method
        window.Geolocation.prototype.getCurrentPosition;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const _watchPosition = window.Geolocation.prototype.watchPosition;

      window.Geolocation.prototype.getCurrentPosition = function (...args) {
        return _this.apiExecuteHook(ApiMethodType.GetPosition, args, () =>
          _getCurrentPosition.apply(this, args)
        );
      };

      window.Geolocation.prototype.watchPosition = function (...args) {
        return _this.apiExecuteHook(ApiMethodType.WatchPostion, args, () =>
          _watchPosition.apply(this, args)
        );
      };
    }
  }

  private setClipboardHook() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    if (window.Clipboard) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const _writeText = window.Clipboard.prototype.writeText;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const _readText = window.Clipboard.prototype.readText;

      // eslint-disable-next-line @typescript-eslint/require-await
      window.Clipboard.prototype.writeText = async function (...args) {
        return _this.apiExecuteHook(ApiMethodType.WriteText, args, () =>
          _writeText.apply(this, args)
        );
      };

      window.Clipboard.prototype.readText = function (...args) {
        return _this.apiExecuteHook(ApiMethodType.ReadText, args, () =>
          _readText.apply(this, args)
        );
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const _write = window.Clipboard.prototype.write;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const _read = window.Clipboard.prototype.read;

      // eslint-disable-next-line @typescript-eslint/require-await
      window.Clipboard.prototype.write = async function (...args) {
        return _this.apiExecuteHook(ApiMethodType.Write, args, () =>
          _write.apply(this, args)
        );
      };

      window.Clipboard.prototype.read = function (...args) {
        return _this.apiExecuteHook(ApiMethodType.Read, args, () =>
          _read.apply(this, args)
        );
      };
    }
  }

  private setMediaDevicesHook() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    if (window.MediaDevices) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const _getUserMedia = window.MediaDevices.prototype.getUserMedia;

      // eslint-disable-next-line @typescript-eslint/require-await
      window.MediaDevices.prototype.getUserMedia = async function (...args) {
        return _this.apiExecuteHook(ApiMethodType.GetMedia, args, () =>
          _getUserMedia.apply(this, args)
        );
      };
    }
  }

  /**
   * @param {*} name
   * @param {function} callback
   * @return {*}
   * @description: 执行 hooks 的方法
   */
  private apiExecuteHook(name: ApiMethodType, value: any, callback: () => any) {
    let returnVal;
    const findApi = isApiWhitelist(name, this.apiWhitelist);
    if (findApi) {
      if (this.isBlock) {
        if (this.isApiAllowRule(findApi)) {
          returnVal = callback();
        } else {
          // 超出限频发生拦截
          blockModeWarning(ApiMethodText[name]);
          const payload: IReport = {
            isBlock: 1,
            dataType: DATA_TYPE.Api,
            data: {
              name_id: name,
              name: ApiMethodText[name],
              value,
            },
            reportDate: new Date().valueOf(),
          };
          this.reportData.push(payload);
          this.report(payload);
        }
      } else {
        returnVal = callback();
      }
    } else {
      if (!hasApiReport(name, this.reportData)) {
        const payload: IReport = {
          isBlock: this.isBlock ? 1 : 0,
          dataType: DATA_TYPE.Api,
          data: {
            name_id: name,
            name: ApiMethodText[name],
            value,
          },
          reportDate: new Date().valueOf(),
        };
        this.reportData.push(payload);
        this.report(payload);
      }

      if (this.isBlock) {
        // 拦截
        returnVal = errorToBlock(name);
        blockModeWarning(ApiMethodText[name]);
      } else {
        returnVal = callback();
      }
    }
    return returnVal;
  }

  private isApiAllowRule(findApi: IApi) {
    const { apiFrequency } = this;
    const { name, frequency = 0, limit = 0, matchUrl = [] } = findApi;
    if (isApiAllowUrl(location.href, matchUrl)) {
      if (frequency && limit) {
        const now = getNowTime();
        if (now < apiFrequency[name as ApiMethodType].timeStamp + frequency) {
          apiFrequency[name as ApiMethodType].reqCount++;
          // 当前时间内是否超过最大限制
          return (
            apiFrequency[name as ApiMethodType].reqCount <=
            (findApi.limit as number)
          );
        } else {
          // 超时后重置
          apiFrequency[name as ApiMethodType].timeStamp = now;
          apiFrequency[name as ApiMethodType].reqCount = 1;
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }
}
