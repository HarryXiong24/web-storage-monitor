import {
  ApiMethodType,
  DATA_TYPE,
  IReport,
  MatchMode,
  IApi,
  ApiMethodText,
  TMatchUrl,
} from '../types';

// TODO: 统一与storage、cookie的行为，返回boolean
export const isApiWhitelist = (name: string, apis: IApi[]) => {
  const findApi = apis.find((item) => item.name === name);
  if (findApi) {
    return findApi;
  }
  return null;
};

export const hasApiReport = (name: string, entireReportData: IReport[]) => {
  const data = entireReportData.find(
    (item) => DATA_TYPE.Api === item.dataType && name === item.data.name
  );
  if (data) {
    return true;
  }
  return false;
};

export const errorToBlock = (name: ApiMethodType) => {
  if (
    [
      ApiMethodType.ReadText,
      ApiMethodType.WriteText,
      ApiMethodType.Read,
      ApiMethodType.Write,
    ].includes(name)
  ) {
    return Promise.reject(
      new DOMException(`API ${ApiMethodText[name]} Block`, 'NotAllowedError')
    );
  } else if (name === ApiMethodType.GetMedia) {
    return Promise.reject(new DOMException(`API ${ApiMethodText[name]} Block`));
  }
};

export const isApiAllowUrl = (href: string, matchUrlList: TMatchUrl[]) => {
  if (matchUrlList.length === 0) {
    return true;
  }
  let isMatch = false;
  for (let i = 0; i < matchUrlList.length; i++) {
    const { url, type } = matchUrlList[i];
    if (type === MatchMode.Exact && href === url) {
      isMatch = true;
      break;
    } else if (type === MatchMode.Prefix && href.startsWith(url)) {
      isMatch = true;
      break;
    }
  }
  return isMatch;
};
