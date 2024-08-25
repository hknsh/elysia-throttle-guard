import type { Server } from "bun";
import type { Generator } from "../@types/generator";

/** Default client address validation */
export const defaultGenerator: Generator<unknown> = (
  request,
  server,
): string => {
  const address = server?.requestIP(request)?.address;

  if (address !== undefined) {
    return address;
  }

  const reason = determineFailureReason(request, server);

  console.warn(
    `[elysia-throttle-guard] failed to determine client address (reason: ${reason})`,
  );

  return "";
};

function determineFailureReason(
  request: Request,
  server: Server | null,
): string {
  if (!request)
    return "expected request to be type Request, received undefined";
  if (!server) return "expected server to be type Server, received null";
  if (!server.requestIP(request)) return "function requestIP() returned null";
  if (!server.requestIP(request)?.address)
    return "expected a value in requestIP()?.address, received undefined";
  return "unknown";
}
