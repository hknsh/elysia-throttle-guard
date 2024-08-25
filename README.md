# Elysia Throttle Guard

A simple rate limiter plugin for Elysia.

## Compatibility

This plugin only works with Elysia >= `1.0.0` and Bun > `1.0.3`.

It can theoretically work with any Redis client that supports raw commands, but, it's recommended to use it with `ioredis` or `node-redis`.

## Installation

You can easily install this plugin using:

```sh
bun a elysia-throttle-guard
```

## Usage

Basic usage, using in-memory storage:

```TypeScript
import Elysia from "elysia";
import { ThrottleGuard } from "elysia-throttle-guard";

const app = new Elysia()
  .use(ThrottleGuard())
  .get("/", () => {
    return { message: "Hello World" };
  })
  .listen(3000, () => {
    console.log("🦊 Elysia is running at: http://localhost:3000");
  });

```

With [ioredis](https://github.com/redis/ioredis):

```TypeScript
import Elysia from "elysia";
import Redis from "ioredis";
import { ThrottleGuard, RedisContext } from "elysia-throttle-guard";

const client = new Redis();

const app = new Elysia()
  .use(
    ThrottleGuard({
      store: "redis",
      context: new RedisContext({
        sendCommand: async (command: string, ...args: string[]) =>
          client.call(command, args),
      }),
    }),
  )
  .get("/", () => {
    return { message: "Hello World" };
  })
  .listen(3000, () => {
    console.log("🦊 Elysia is running at: http://localhost:3000");
  });

```

## Credits

This project is heavily based on [rayriffy/elysia-rate-limit](https://github.com/rayriffy/elysia-rate-limit) and on [express-rate-limit/rate-limit-redis](https://github.com/express-rate-limit/rate-limit-redis).

## License

MIT © [hknsh](https://github.com/hknsh)
