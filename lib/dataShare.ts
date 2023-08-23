import {
  IReport,
  IShare,
  IShareData,
  ShareReport,
  ShareRequestType,
  DATA_TYPE,
} from './types';
import { blockModeWarning } from './utils/general';

export default class DataShare {
  private isBlock = false;
  private nativeXMLHttpRequestOpen;
  private nativeXMLHttpRequestSend;
  private nativeXMLHttpRequestSetRequestHeader;
  private nativeSendBeacon;
  private nativeFetch: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<Response>;
  private _report: (value: IReport) => void;
  private reportData: ShareReport[] = [];
  private shareWhitelist: IShare[] = [];

  constructor(
    isBlock: boolean,
    shareWhitelist: IShare[],
    report: (value: IReport) => void
  ) {
    this.isBlock = isBlock;
    this._report = report;
    this.shareWhitelist = shareWhitelist;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.nativeXMLHttpRequestOpen = window.XMLHttpRequest.prototype.open;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.nativeXMLHttpRequestSend = window.XMLHttpRequest.prototype.send;
    this.nativeXMLHttpRequestSetRequestHeader =
      // eslint-disable-next-line @typescript-eslint/unbound-method
      window.XMLHttpRequest.prototype.setRequestHeader;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.nativeSendBeacon = Navigator.prototype.sendBeacon;
    this.nativeFetch = window.fetch;
    this.monkeyPatchXMLHttpRequest();
    this.monkeyPatchImage();
    this.monkeyPatchSendBeacon();
    this.monkeyPatchFech();
  }

  private getURL(url: string): [URL | null, Error | null] {
    try {
      const u = new URL(url, window.location.href);
      return [u, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  private shouldBlockShare(url: string) {
    if (!this.isBlock) {
      return false;
    }

    const [u, err] = this.getURL(url);
    if (err) {
      return false;
    }

    if (
      Array.isArray(this.shareWhitelist) &&
      this.shareWhitelist.some((item) => item.domain === u.host)
    ) {
      return false;
    }

    return true;
  }

  private genRportData(
    requestType: ShareRequestType,
    data: IShareData
  ): ShareReport | Error {
    const [u, err] = this.getURL(data?.url);

    if (err) {
      return err;
    }

    return {
      isBlock: this.isBlock ? 1 : 0,
      dataType: DATA_TYPE.Share,
      data: {
        ...data,
        domain: (u as URL).host,
        pathname: (u as URL).pathname,
        source: location.href,
        requestType,
      },
    };
  }

  private report(requestType: ShareRequestType, value: IShareData) {
    const data = this.genRportData(requestType, value);
    if (data instanceof Error) {
      return;
    }

    if (this.shouldReport(data)) {
      this.reportData.push(data);
      this._report(data);
    }
  }

  private shouldReport(value: ShareReport) {
    const { data } = value;
    const { domain, pathname, requestType, method } = data;
    if (!domain) {
      return false;
    }

    // 一方数据不上报
    if (domain === location.host || domain.endsWith(`.${location.host}`)) {
      return false;
    }

    // 白名单内的不上报
    if (
      Array.isArray(this.shareWhitelist) &&
      this.shareWhitelist.some((item) => item.domain === domain)
    ) {
      return false;
    }

    const isExist = this.reportData.some((item) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { data } = item;
      return (
        data.requestType === requestType &&
        data.pathname === pathname &&
        data.method === method &&
        data.domain === domain
      );
    });

    return !isExist;
  }

  private monkeyPatchFech() {
    /* istanbul ignore next */
    if (!window.fetch) {
      return;
    }

    const _this = this;

    window.fetch = function (
      input: RequestInfo,
      init?: RequestInit
    ): Promise<Response> {
      let url: string, method: string;
      if (input instanceof Request) {
        url = input.url;
        method = input.method;
      } else {
        url = input;
        method = init && init.method ? init.method : 'GET';
      }

      if (_this.shouldBlockShare(url)) {
        blockModeWarning(url);
        return;
      }

      _this.report('fetch', { url, method });
      return _this.nativeFetch.apply(this, [input, init]);
    };
  }

  private monkeyPatchSendBeacon() {
    /* istanbul ignore next */
    if (!Navigator.prototype.sendBeacon) {
      return;
    }

    const _this = this;

    Navigator.prototype.sendBeacon = function (
      url: string | URL,
      data?: BodyInit
    ): boolean {
      const u = typeof url === 'string' ? url : url.href;

      if (_this.shouldBlockShare(u)) {
        blockModeWarning(u);
        return;
      }

      _this.report('beacon', { url: u });
      return _this.nativeSendBeacon.apply(this, arguments);
    };
  }

  private monkeyPatchXMLHttpRequest() {
    /* istanbul ignore next */
    if (!window.XMLHttpRequest.prototype.open) {
      return;
    }

    const _this = this;
    const dataSymbol = '_cmp_data';
    XMLHttpRequest.prototype.open = function (): void {
      this[dataSymbol] = this[dataSymbol] || {};
      this[dataSymbol].method = arguments[0] || 'GET';
      this[dataSymbol].url = arguments[1];
      _this.nativeXMLHttpRequestOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (
      name: string,
      value: string
    ): void {
      this[dataSymbol] = this[dataSymbol] || {};
      this[dataSymbol].headers = this[dataSymbol]?.headers || {};
      this[dataSymbol].headers[name] = value;

      _this.nativeXMLHttpRequestSetRequestHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (): void {
      const { url } = this[dataSymbol] || {};
      if (_this.shouldBlockShare(url)) {
        blockModeWarning(url);
        return;
      }

      _this.nativeXMLHttpRequestSend.apply(this, arguments);
      _this.report('xhr', this[dataSymbol]);
    };
  }

  private domainThrottleMap: Record<string, number> = {};
  private THROTTLE_INTERVAL = 40 * 1000;
  private domainImageCount: Record<string, number> = {};
  private IMAGE_MAX_COUNT = 20;

  private shouldBlockImage(value: string): boolean {
    const [url, err] = this.getURL(value);
    // 没有参数不存在数据共享的可能，base64的形式也不存在search
    if (err || !url?.search) {
      return false;
    }

    if (this.shouldBlockShare(value)) {
      blockModeWarning(url as unknown as string);
      return true;
    }

    const domain = url.host;
    const lastTime = this.domainThrottleMap[domain];
    const count = this.domainImageCount[domain] || 0;
    const now = Date.now();
    // 限频 + 域下存储的image最大数量，两个限制
    if (
      (!lastTime || now - lastTime > this.THROTTLE_INTERVAL) &&
      count < this.IMAGE_MAX_COUNT
    ) {
      this.domainThrottleMap[domain] = now;
      this.domainImageCount[domain] = count + 1;
      this.report('image', { url: value });
    }

    return false;
  }

  private monkeyPatchImage() {
    const _this = this;
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'src'
    );

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      set(value) {
        const isBlock = _this.shouldBlockImage(value);
        if (isBlock) {
          return;
        }

        return descriptor?.set?.call(this, value);
      },

      get() {
        return descriptor!.get!.call(this);
      },
    });
  }
}
