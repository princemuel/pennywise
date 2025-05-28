import { isResponse, isString } from "@/utils/guards";
import { createError, HttpError, isHttpError } from "http-errors-enhanced";
import type { GenericObject } from "node_modules/http-errors-enhanced/dist/utils";

interface ErrorResponse {
  code: string;
  status: number;
  payload: string;
}

const HTTP_ERROR_MAP = new Map([
  ["AbortError", 499],
  ["TimeoutError", 408],
  ["TypeError", 400],
  ["SyntaxError", 500],
  ["NetworkError", 503],
  ["NotFoundError", 404],
  ["UnknownError", 501],
]);

// Helper functions
export const throwAsError = (exception: unknown) => {
  throw isString(exception) ? new Error(exception) : exception;
};

export const getErrorMessage = (exception: unknown): string => {
  if (exception instanceof Error) return exception.message;
  if (isString(exception)) return exception;
  return "An unknown error occurred";
};

const toHttpStatus = (error: unknown): number => {
  return error instanceof Error ? (HTTP_ERROR_MAP.get(error.name) ?? 500) : 500;
};

export const toHttpErrorResponse = (exception: unknown): ErrorResponse => {
  if (isHttpError(exception)) {
    return { code: exception.code, status: exception.status, payload: exception.message };
  }

  if (isResponse(exception)) {
    const { status, statusText } = exception;
    const { code, message } = createError(status, statusText);
    return { code, status, payload: message };
  }

  if (exception instanceof Error) {
    const status = toHttpStatus(exception);
    const { code, message } = createError(status, exception.message);
    return { code, status, payload: message };
  }

  const status = 500;
  const message = isString(exception) ? exception : "An unknown error occurred";
  const { code } = createError(status, message);
  return { code, status, payload: message };
};

export class ClientClosedRequestError extends HttpError {
  static status = 499;
  static error = "ClientClosedRequest";
  static message = "Client Closed Request";
  static phrase = "Client closed request.";
  constructor(
    message: string | GenericObject | undefined,
    properties: GenericObject | undefined,
  ) {
    super(499, message, properties);
    this.name = "ClientClosedRequestError";
  }
}
