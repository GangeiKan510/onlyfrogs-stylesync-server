import { AppError } from '../middleware/exceptions/app-error';
import logger from './logger-utils';

export interface CreateErrorParams {
  statusCode: number;
  errorMessage?: string;
  debugMessage?: string;
}
export const createAppError = (params: CreateErrorParams) => {
  const description = params.errorMessage ?? 'Unknown error';
  logger.error(
    `Creating error (${params.statusCode}) : ${description} ${params.debugMessage ? `(debug message: ${params.debugMessage})` : ''}`
  );
  return new AppError({
    httpCode: params.statusCode,
    description: description,
  });
};

export const createError400 = (message: string, debugMessage?: string) => {
  let error = createAppError({
    statusCode: 400,
    errorMessage: message,
    debugMessage,
  });
  delete error.stack;
  return error;
};

export const createError401 = (message: string, debugMessage?: string) => {
  let error = createAppError({
    statusCode: 401,
    errorMessage: message,
    debugMessage,
  });
  delete error.stack;
  return error;
};

export const createError403 = (message: string, debugMessage?: string) => {
  let error = createAppError({
    statusCode: 403,
    errorMessage: message,
    debugMessage,
  });
  delete error.stack;
  return error;
};

export const createError404 = (message: string, debugMessage?: string) => {
  let error = createAppError({
    statusCode: 404,
    errorMessage: message,
    debugMessage,
  });
  delete error.stack;
  return error;
};

export const createError500 = (message: string, debugMessage?: string) => {
  let error = createAppError({
    statusCode: 500,
    errorMessage: message,
    debugMessage,
  });
  delete error.stack;
  return error;
};
