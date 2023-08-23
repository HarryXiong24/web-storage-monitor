import {
  ICookie,
  IReport,
  IStorage,
  IIndexedDB,
  DATA_TYPE,
  Duration,
  StorageType,
} from '../types';
import { isKeyPattern, keyPatternToRegexp } from './general';

export const isInStorageWhitelist = (
  key: string,
  duration: number,
  whitelist: IStorage[]
): boolean => {
  if (!Array.isArray(whitelist)) {
    return false;
  }
  return whitelist
    .filter((storage) => storage.duration === duration)
    .some((storage) => {
      if (isKeyPattern(storage.name as string)) {
        const patternReg = keyPatternToRegexp(storage.name as string);
        return new RegExp(patternReg).test(key);
      } else {
        return storage.name === key;
      }
    });
};

export const hasStorageReport = (
  key: string,
  value: string,
  type: StorageType,
  duration: number,
  entireReportData: IReport[]
): boolean => {
  const data = entireReportData.find(
    (item) =>
      DATA_TYPE.Storage === item.dataType &&
      key === item.data.name &&
      value === item.data.value &&
      type === item.data.type &&
      duration === item.data.duration
  );
  if (data) {
    return true;
  }
  return false;
};

export const isInCookieWhitelist = (
  name: string,
  whitelist: ICookie[]
): boolean => {
  if (!Array.isArray(whitelist)) {
    return false;
  }

  return whitelist.some((cookie) => {
    if (isKeyPattern(cookie.name as string)) {
      const patternReg = keyPatternToRegexp(cookie.name as string);
      return new RegExp(patternReg).test(name);
    } else {
      return cookie.name === name;
    }
  });
};

export const hasCookieReport = (
  name: string,
  value: string,
  originalCookie: string,
  entireReportData: IReport[]
) => {
  const data = entireReportData.find(
    (item) =>
      DATA_TYPE.Cookie === item.dataType &&
      name === item.data.name &&
      value === item.data.value &&
      originalCookie === (item.data as ICookie).originalCookie
  );
  if (data) {
    return true;
  }
  return false;
};

export const parseCookie = (data: string) => {
  const cookie: ICookie = {
    name: '',
    originalCookie: data,
  };
  const attrList = data.split(';');
  if (attrList[0].indexOf('=') < 0) {
    return null;
  }
  attrList.map((attr: any, index: number) => {
    const attrName = attr.replace(/=(.*)/, '').trim();
    if (index === 0) {
      cookie.name = attrName.trim();
      const value = (attr.split('=')[1] || '').trim();
      if (value) {
        cookie.value = value;
      }
    }
    if (attrName.toLocaleLowerCase() === 'domain') {
      const value = (attr.split('=')[1] || '').trim();
      cookie.domain = value;
    }

    if (attrName.toLocaleLowerCase() === 'httponly') {
      cookie.httpOnly = 2;
    }
    if (attrName.toLocaleLowerCase() === 'secure') {
      cookie.secure = 2;
    }
    if (attrName.toLocaleLowerCase() === 'max-age') {
      const value = (attr.split('=')[1] || '').trim();
      if (!isNaN(value)) {
        cookie.duration = parseInt(value, 10);
      }
    }
    if (attrName.toLocaleLowerCase() === 'expires') {
      const value = (attr.split('=')[1] || '').trim();
      cookie.expires = value;
      try {
        const diffTime =
          Math.floor(new Date(value).getTime() / 1000) -
          Math.floor(new Date().getTime() / 1000);
        if (
          (cookie.duration !== undefined && cookie.duration < diffTime) ||
          cookie.duration === undefined
        ) {
          cookie.duration = diffTime;
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
  if (cookie.duration === undefined) {
    cookie.duration = -1;
  }
  return cookie;
};

export const hasIndexedDBReport = (
  dbName: string,
  storeName: string,
  entireReportData: IReport[]
) => {
  const data = entireReportData.find(
    (item) =>
      DATA_TYPE.IndexedDB === item.dataType &&
      dbName === item.data.dbName &&
      storeName === item.data.storeName
  );
  if (data) {
    return true;
  }
  return false;
};

export const isInIndexedDBWhitelist = (
  name: string,
  whitelist: IIndexedDB[]
): boolean => {
  /* istanbul ignore next */
  if (!Array.isArray(whitelist)) {
    return false;
  }

  return whitelist.some((indexedDB) => indexedDB.dbName === name);
};

export const deleteStorage = (name: string, duration: number) => {
  if (duration === Duration.Persistent) {
    window.localStorage.removeItem(name);
  } else if (duration === Duration.Session) {
    window.sessionStorage.removeItem(name);
  }
};

export const deleteCookie = (name: string) => {
  const expires = 'Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  const pathname = location.pathname.split('/').slice(0, -1).join('/');
  const rootDomain = document.domain.split('.').slice(-2).join('.');

  document.cookie = `${name}=; Path=/; ${expires}`;
  document.cookie = `${name}=; domain=.${rootDomain}; Path=/; ${expires}`;
  document.cookie = `${name}=; domain=.${document.domain}; Path=/; ${expires}`;

  document.cookie = `${name}=; Path=${pathname}; ${expires}`;
  document.cookie = `${name}=; domain=.${rootDomain}; Path=${pathname}; ${expires}`;
  document.cookie = `${name}=; domain=.${document.domain}; Path=${pathname}; ${expires}`;
};
