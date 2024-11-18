import { parseError } from "@/helpers/error";
import type { ErrorResponse } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { Container } from "./container";

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => JSX.Element | null;

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{parseError(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}) {
  const error = useRouteError();
  const params = useParams();

  if (typeof document !== "undefined") console.error(error);

  return (
    <Container className="flex items-center justify-center p-20">
      <p className="text-xl">
        {isRouteErrorResponse(error)
          ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
              error,
              params,
            })
          : unexpectedErrorHandler(error)}
      </p>
    </Container>
  );
}
