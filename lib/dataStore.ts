import {
  DATA_TYPE,
  Duration,
  ICookie,
  IIndexedDB,
  IReport,
  IStorage,
  StorageType,
} from './types';
import {
  deleteCookie,
  deleteStorage,
  hasCookieReport,
  hasIndexedDBReport,
  hasStorageReport,
  isInCookieWhitelist,
  isInIndexedDBWhitelist,
  isInStorageWhitelist,
  parseCookie,
} from './utils/dataStorageUtils';

const storageList = [
  {
    target: window.localStorage,
    duration: Duration.Persistent,
    storageType: StorageType.LocalStorage,
  },
  {
    target: window.sessionStorage,
    duration: Duration.Session,
    storageType: StorageType.SessionStorage,
  },
];

export default class DataStore {
  private isBlock = false;
  private cookieWhitelist: ICookie[] = [];
  private storageWhitelist: IStorage[] = [];
  private indexedDBWhitelist: IIndexedDB[] = [];
  private reportData: IReport[] = [];
  private report: (value: IReport | IReport[]) => void;
  private nativeLocalStorage: Storage;

  constructor(
    isBlock: boolean,
    cookieWhitelist: ICookie[],
    storageWhitelist: IStorage[],
    indexedDBWhitelist: IIndexedDB[],
    report: (value: IReport | IReport[]) => void
  ) {
    this.isBlock = isBlock;
    this.cookieWhitelist = cookieWhitelist;
    this.storageWhitelist = storageWhitelist;
    this.indexedDBWhitelist = indexedDBWhitelist;
    this.report = report;
    this.nativeLocalStorage = window.localStorage;

    this.setStorageHook();
    this.setDocumentCookieHook();
    this.setIndexedDBHook();
    // this.monitorAllStorages();
    // this.monitorAllCookies();
    // this.monitorDomContentLoaded();
  }

  /**
   * @return {*}
   * @description: 重写 storage 方法
   */
  private setStorageHook() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originSetItem = Storage.prototype.setItem;

    // 重写 setItem 方法
    Storage.prototype.setItem = function (...args: any) {
      // 判断是 localStorage 还是 sessionStorage
      const duration =
        this === _this.nativeLocalStorage
          ? Duration.Persistent
          : Duration.Session;
      const storageType =
        this === _this.nativeLocalStorage
          ? StorageType.LocalStorage
          : StorageType.SessionStorage;
      const storageName = args[0];
      const storageValue = args[1];

      if (isInStorageWhitelist(storageName, duration, _this.storageWhitelist)) {
        // 在白名单里，不做任何操作
        originSetItem.apply(this, args);
      } else {
        // 如果不在 reportData 里，生成 reportData
        if (
          !hasStorageReport(
            storageName,
            storageValue,
            storageType,
            duration,
            _this.reportData
          )
        ) {
          const payload = _this.genStorageReport(
            storageName,
            storageValue,
            duration,
            storageType
          );
          _this.reportData.push(payload);
          _this.report(payload);
        }
        // 如果没有禁用该功能，照常执行，否则关闭该功能
        if (!_this.isBlock) {
          originSetItem.apply(this, args);
        }
      }
    };
  }

  private setDocumentCookieHook() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    const cookieDesc: any =
      Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
      Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');

    if (cookieDesc && cookieDesc.configurable) {
      Object.defineProperty(document, 'cookie', {
        get() {
          return cookieDesc.get.call(document);
        },
        set(value) {
          if (value.indexOf('Expires=Thu, 01 Jan 1970 00:00:01 GMT;') > -1) {
            cookieDesc.set.call(document, value);
            return true;
          }
          const cookie = parseCookie(value);
          if (!cookie) {
            cookieDesc.set.call(document, value);
            return true;
          }

          if (
            isInCookieWhitelist(cookie.name as string, _this.cookieWhitelist)
          ) {
            cookieDesc.set.call(document, value);
          } else {
            if (
              !hasCookieReport(
                cookie.name as string,
                cookie.value as string,
                cookie.originalCookie as string,
                _this.reportData
              )
            ) {
              const payload = _this.genCookieReport(cookie);
              _this.reportData.push(payload);
              _this.report(payload);
            }
            if (!_this.isBlock) {
              cookieDesc.set.call(document, value);
            }
          }
        },
      });
    }
  }

  private setIndexedDBHook() {
    if (!IDBDatabase || !IDBObjectStore || !IDBCursor) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    // indexedDB 表存储、更新数据的方法
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originStoreAdd = IDBObjectStore.prototype.add;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originStorePut = IDBObjectStore.prototype.put;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originStoreUpdate = IDBCursor.prototype.update;

    IDBObjectStore.prototype.add = function (...args): any {
      try {
        const value = args[0];
        const dbName = this.transaction?.db?.name;
        const storeName = this.name;
        if (isInIndexedDBWhitelist(dbName, _this.indexedDBWhitelist)) {
          return originStoreAdd.apply(this, args);
        } else {
          if (!hasIndexedDBReport(dbName, storeName, _this.reportData)) {
            const payload = _this.genIndexedDBStoreReport(
              dbName,
              storeName,
              value
            );
            _this.reportData.push(payload);
            _this.report(payload);
          }
          if (!_this.isBlock) {
            return originStoreAdd.apply(this, args);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    IDBObjectStore.prototype.put = function (...args): any {
      try {
        const value = args[0];
        const dbName = this.transaction?.db?.name;
        const storeName = this.name;
        if (isInIndexedDBWhitelist(dbName, _this.indexedDBWhitelist)) {
          return originStorePut.apply(this, args);
        } else {
          if (!hasIndexedDBReport(dbName, storeName, _this.reportData)) {
            const payload = _this.genIndexedDBStoreReport(
              dbName,
              storeName,
              value
            );
            _this.reportData.push(payload);
            _this.report(payload);
          }
          if (!_this.isBlock) {
            return originStorePut.apply(this, args);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    IDBCursor.prototype.update = function (...args): any {
      try {
        const value = args[0];
        const dbName = (this.source as any)?.transaction?.db?.name;
        const storeName = this.source?.name;
        if (isInIndexedDBWhitelist(dbName, _this.indexedDBWhitelist)) {
          return originStoreUpdate.apply(this, args);
        } else {
          if (!hasIndexedDBReport(dbName, storeName, _this.reportData)) {
            const payload = _this.genIndexedDBStoreReport(
              dbName,
              storeName,
              value
            );
            _this.reportData.push(payload);
            _this.report(payload);
          }
          if (!_this.isBlock) {
            return originStoreUpdate.apply(this, args);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
  }

  /**
   * @return {*}
   * @description: 生成 storage 报告
   */
  private genStorageReport(
    storageKey: string,
    storageValue: string,
    duration: Duration,
    storageType: StorageType
  ): IReport {
    return {
      isBlock: this.isBlock,
      dataType: DATA_TYPE.Storage,
      data: {
        name: storageKey,
        duration,
        value: storageValue,
        type: storageType,
      },
      reportDate: new Date().valueOf(),
    };
  }

  /**
   * @return {*}
   * @description: 生成 cookie 报告
   */
  private genCookieReport(cookie: ICookie): IReport {
    return {
      isBlock: this.isBlock,
      dataType: DATA_TYPE.Cookie,
      data: cookie,
      reportDate: new Date().valueOf(),
    };
  }

  /**
   * @return {*}
   * @description: 生成 indexedDB 报告
   */
  private genIndexedDBStoreReport(
    dbName: string,
    storeName: string,
    value: any
  ): IReport {
    return {
      isBlock: this.isBlock,
      dataType: DATA_TYPE.IndexedDB,
      data: {
        dbName,
        storeName,
        value,
      },
      reportDate: new Date().valueOf(),
    };
  }

  private monitorAllCookies() {
    const { isBlock, cookieWhitelist } = this;
    const reportList: IReport[] = [];
    const allCookies = document.cookie.split(';');
    allCookies.forEach((item) => {
      const result = parseCookie(item);
      if (result) {
        if (!isInCookieWhitelist(result.name as string, cookieWhitelist)) {
          if (
            !hasCookieReport(
              result.name as string,
              result.value as string,
              result.originalCookie as string,
              this.reportData
            )
          ) {
            const payload = this.genCookieReport(result);
            this.reportData.push(payload);
            reportList.push(payload);
          }
          if (isBlock) {
            deleteCookie(result.name as string);
          }
        }
      }
    });

    if (reportList.length) {
      this.report(reportList);
    }
  }

  private monitorAllStorages() {
    const reportList: IReport[] = [];

    storageList.forEach((storage) => {
      const { target, duration, storageType } = storage;
      if (!target.length) {
        return;
      }

      for (const key in target) {
        const value = target.getItem(key);
        if (!value) {
          continue;
        }
        if (!isInStorageWhitelist(key, duration, this.storageWhitelist)) {
          if (
            !hasStorageReport(
              key,
              value,
              storageType,
              duration,
              this.reportData
            )
          ) {
            const payload = this.genStorageReport(
              key,
              value,
              duration,
              storageType
            );
            this.reportData.push(payload);
            reportList.push(payload);
          }

          if (this.isBlock) {
            deleteStorage(key, duration);
          }
        }
      }
    });

    this.report(reportList);
  }

  private monitorDomContentLoaded() {
    /* istanbul ignore next */
    document.addEventListener('DOMContentLoaded', () => {
      this.monitorAllCookies();
      this.monitorAllStorages();
    });
  }
}
