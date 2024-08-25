import Elysia from "elysia";
import { createClient } from "redis";
import { ThrottleGuard } from "../src";
import { RedisContext } from "../src/defaults/redis_context";

const client = createClient();

// Connect to the server
await client.connect();

const app = new Elysia()
  .use(
    ThrottleGuard({
      store: "redis",
      context: new RedisContext({
        sendCommand: async (...args: string[]) => client.sendCommand(args),
      }),
    }),
  )
  .get("/", () => {
    return { message: "Hello World" };
  })
  .listen(3000, () => {
    console.log("🦊 Elysia is running at: http://localhost:3000");
  });
