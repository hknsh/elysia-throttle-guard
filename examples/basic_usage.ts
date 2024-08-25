import Elysia from "elysia";
import { ThrottleGuard } from "../src";

const app = new Elysia()
  .use(ThrottleGuard())
  .get("/", () => {
    return { message: "Hello World" };
  })
  .listen(3000, () => {
    console.log("🦊 Elysia is running at: http://localhost:3000");
  });
