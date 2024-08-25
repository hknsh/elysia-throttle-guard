import Elysia from "elysia";
import type { Context as ElysiaContext } from "elysia";
import type { Context } from "../@types/context";
import type { Options } from "../@types/options";
import { defaultOptions } from "../defaults/default_options";
import { MemoryContext } from "../defaults/memory_context";
import { RedisContext } from "../defaults/redis_context";

export const plugin = (userOptions?: Partial<Options>) => {
  let context: Context;

  if (userOptions?.store === "redis") {
    if (
      !userOptions.context ||
      !(userOptions.context instanceof RedisContext)
    ) {
      throw new Error(
        "Redis storage selected, but no valid Redis instance was provided.",
      );
    }
    context = userOptions.context;
  } else {
    context = new MemoryContext();
  }

  const options: Options = {
    ...defaultOptions,
    ...userOptions,
    context,
  };

  options.context.init(options);

  return (app: Elysia) => {
    const plugin = new Elysia({
      name: "elysia-throttle-guard",
    });

    plugin.onBeforeHandle({ as: options.scope }, async (context) => {
      const { set, request, ...rest } = context;
      const server = options.injectServer?.() ?? app.server;

      let address: string | undefined;

      const generateClientAddress = async () => {
        if (!address) {
          address = await options.generator(request, server, rest);
        }
        return address;
      };

      if (options.skip.length >= 2) {
        address = await generateClientAddress();
      }

      if (!(await options.skip(request, address))) {
        if (options.skip.length < 2) {
          address = await generateClientAddress();
        }

        if (address) {
          const { count, nextReset } = await options.context.increment(address);

          const payload = buildPayload(count, nextReset);

          const builtHeaders = buildHeaders(payload);

          if (payload.current >= payload.limit + 1) {
            builtHeaders["Retry-After"] = String(
              Math.ceil(options.duration / 1000),
            );

            return handleErrorResponse(builtHeaders, set);
          }
          addHeaders(set, builtHeaders);
        } else {
          throw new Error("Failed to generate client address");
        }
      }
    });

    plugin.onError({ as: options.scope }, async (context) => {
      const { request, error, ...rest } = context;

      if (!options.countFailedRequest) {
        const address = await options.generator(
          request,
          options.injectServer?.() ?? app.server,
          rest,
        );

        await options.context.decrement(address);
      }
    });

    plugin.onStop(async () => {
      await options.context.kill();
    });

    return app.use(plugin);

    function buildPayload(count: number, nextReset: Date) {
      return {
        limit: options.max,
        current: count,
        remaining: Math.max(options.max - count, 0),
        nextReset,
      };
    }

    function buildHeaders(
      payload: ReturnType<typeof buildPayload>,
    ): Record<string, string> {
      const reset = Math.max(
        0,
        Math.ceil((payload.nextReset.getTime() - Date.now()) / 1000),
      );
      return {
        "RateLimit-Limit": String(options.max),
        "RateLimit-Remaining": String(payload.remaining),
        "RateLimit-Reset": String(reset),
      };
    }

    function addHeaders(
      set: ElysiaContext["set"],
      headers: Record<string, string>,
    ) {
      if (options.headers) {
        for (const [k, v] of Object.entries(headers)) {
          set.headers[k] = v;
        }
      }
    }

    function handleErrorResponse(
      headers: Record<string, string>,
      set: ElysiaContext["set"],
    ): Options["response"] {
      if (options.response instanceof Error) {
        throw options.response;
      }

      if (options.response instanceof Response) {
        const cloned_response = options.response.clone(); // wth am i coding in rust now?

        if (options.headers) {
          for (const [k, v] of Object.entries(headers)) {
            cloned_response.headers.set(k, v);
          }
        }

        return cloned_response;
      }
      addHeaders(set, headers);
      set.status = 429;

      return options.response;
    }
  };
};
