import Elysia from "elysia";
import Redis from "ioredis";
import { RedisContext, ThrottleGuard } from "../src";

const client = new Redis(6379, "127.0.0.1");

const app = new Elysia()
  .use(
    ThrottleGuard({
      store: "redis",
      prefix: "etg:",
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
