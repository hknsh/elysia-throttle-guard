import type { Server } from "bun";
import type { Context } from "./context";
import type { Generator } from "./generator";

export interface Options {
  /** The duration for plugin to remember the request, in milliseconds (Default is `60000ms`) */
  duration: number;

  /** Maximum requests per specified duration (Default is `10`) */
  max: number;

  /** Error response when reaches the rate limiter */
  response: string | Response | Error | Record<string, string>;

  /** Enable rate limiter globally or only within current instance (Default is `global`) */
  scope: "global" | "scoped";

  /** Count the rate limiter when a request fails (Default is `false`) */
  countFailedRequest: boolean;

  /** Use in memory storage or Redis (Default is `memory`) */
  store: "redis" | "memory";

  /** Text to prepend to the key in Redis */
  prefix?: string;

  /** Function to validate client's address */
  generator: Generator<unknown>;

  /** Context for storing requests count */
  context: Context;

  /** Skip certain requests (Default is `not defined`) */
  skip: (req: Request, key?: string) => boolean | Promise<boolean>;

  /** Explicity way to inject server instance to validation function */
  injectServer?: () => Server | null;

  /** Let the plugin control `RateLimit-*` headers (Default is `true`) */
  headers: boolean;
}
