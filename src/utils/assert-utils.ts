import * as ErrorUtils from './error-utils';
import logger from './logger-utils';

export const assertNotNull = <T>(
  obj: T | null | undefined,
  errorCode = 500,
  errorMessage = 'Internal server error',
  debugMessage = errorMessage
) => {
  if (obj === null || obj === undefined) {
    logger.info(`Object (type: (${typeof obj}) is null or undefined`);
    throw ErrorUtils.createAppError({
      statusCode: errorCode,
      errorMessage: errorMessage,
      debugMessage: debugMessage,
    });
  }
};

export const assertNull = <T>(
  obj: T | null | undefined,
  errorCode = 500,
  errorMessage = 'Internal server error'
) => {
  if (obj !== null && obj !== undefined) {
    logger.info(`Object (type: (${typeof obj}) is not null or undefined`);
    throw ErrorUtils.createAppError({
      statusCode: errorCode,
      errorMessage: errorMessage,
    });
  }
};

export function assertNotEmpty<T>(
  obj: T | null | undefined,
  errorCode = 500,
  errorMessage = 'Internal server error'
): asserts obj is T {
  assertNotNull(obj, errorCode, errorMessage);

  if (!obj) {
    throw ErrorUtils.createAppError({
      statusCode: errorCode,
      errorMessage: errorMessage,
    });
  }

  if (Array.isArray(obj) && obj.length === 0) {
    throw ErrorUtils.createAppError({
      statusCode: errorCode,
      errorMessage: errorMessage,
    });
  }
}

export function assertTrue(
  obj: boolean,
  errorCode = 500,
  errorMessage = 'Internal server error'
): asserts obj is true {
  if (obj !== true) {
    throw ErrorUtils.createAppError({
      statusCode: errorCode,
      errorMessage: errorMessage,
    });
  }
}

export function assertFalse(
  obj: boolean,
  errorCode = 500,
  errorMessage = 'Internal server error'
): asserts obj is false {
  if (obj !== false) {
    throw ErrorUtils.createAppError({
      statusCode: errorCode,
      errorMessage: errorMessage,
    });
  }
}
