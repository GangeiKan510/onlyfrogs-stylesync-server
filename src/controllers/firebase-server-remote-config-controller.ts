import merge from 'deepmerge';
import { getRemoteConfig } from 'firebase-admin/remote-config';

import logger from '../utils/logger-utils';
import { firebaseAdminApp } from './firebase-core-controller';

const remoteConfig = getRemoteConfig(firebaseAdminApp);
const template = remoteConfig.initServerTemplate();
await template.load();
let config = template.evaluate();

const BASE_CONFIG = 'default';
const DEFAULT_CONFIG = {};

export const WINSTON_LOGGER_LEVEL = 'winston_logger_level';

const getRemoteConfigJsonValue = (remoteConfig: any, key: string) => {
  try {
    if (!remoteConfig || !key) {
      logger.error('Remote Config object or key is undefined.');
      return {};
    }
    const value = remoteConfig.getString(key);
    return JSON.parse(value);
  } catch (err) {
    logger.error(`Failed to fetch JSON value for key: ${key}`, err);
    return {};
  }
};

const combineMerge = (target: any, source: any, options: any) => {
  const destination = target.slice();

  source.forEach((item: any, index: number) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
};

const resolveRemoteConfig = async (remoteConfig: any) => {
  const wrappedConfig: any = {};
  const remoteBaseConfig = getRemoteConfigJsonValue(remoteConfig, BASE_CONFIG);
  const overrides =
    getRemoteConfigJsonValue(remoteConfig, process.env.FIREBASE_CONFIG_ENV!) ??
    {};

  if (remoteBaseConfig) {
    wrappedConfig[BASE_CONFIG] = remoteBaseConfig;
  }

  const partiallyMergedConfig = merge(
    DEFAULT_CONFIG,
    wrappedConfig[BASE_CONFIG],
    {
      arrayMerge: combineMerge,
    }
  ) as typeof overrides;

  const mergedConfig = merge(partiallyMergedConfig, overrides, {
    arrayMerge: combineMerge,
  }) as typeof partiallyMergedConfig;
  return mergedConfig;
};

export const getConfigValue = async (key: string) => {
  const finalConfig = await resolveRemoteConfig(config);
  return finalConfig[key];
};

export const refreshTemplate = async () => {
  await template.load();
  config = template.evaluate();
};

const firebaseRemoteConfig = {
  getConfigValue,
};

export default firebaseRemoteConfig;
