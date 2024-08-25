import type { MaybePromise } from "elysia";
import type { Options } from "./options";

export interface Context {
  /** Context initialization */
  init(options: Omit<Options, Options["store"]>): void;

  /** Counts the requests */
  increment(key: string): MaybePromise<{
    count: number;
    nextReset: Date;
  }>;

  /** Deducts request in case of request failure */
  decrement(key: string): MaybePromise<void>;

  /** If the key is specified, reset only the specific user, otherwise reset everything */
  reset(key?: string): MaybePromise<void>;

  /** Cleanup function */
  kill(): MaybePromise<void>;
}
