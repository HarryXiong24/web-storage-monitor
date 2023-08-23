export const isKeyPattern = (name: string): boolean => {
  if (!name) {
    return false;
  }
  // 查看字符串内是否有 {xxx}
  return /(\{[\d\D]+?\})/.test(name);
};

/**
 *
 * @param pattern string KeyPattern字符串，如 search_history_{str}
 * @description 将 keyPattern 转换成正则字符串，如上例转换成 ^search_history_([\d\D]+?)$
 */
export const keyPatternToRegexp = (pattern: string): string => {
  return `^${pattern.replace(/\{[\d\D]+?\}/g, '([\\d\\D]+?)')}$`;
};

/**
 * @return {*}
 * @description: 获取当前时间
 */
export const getNowTime = () => Math.ceil(new Date().getTime() / 1000);

/**
 * @return {*}
 * @description: 生成 0-1000 的随机整数
 */
export const rand = () => Math.ceil(Math.random() * 1000);

export const blockModeWarning = (scene: string) => {
  console.warn(`[SDK Block Mode] Refuse to call ${scene}`);
};

// /* istanbul ignore next */
// const isHitSample = (sample) => {
//   const randomNumber = rand();
//   if (randomNumber <= sample) {
//     return true;
//   }
//   return false;
// };
