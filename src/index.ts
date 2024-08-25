// hknsh, 2024. MIT License.

// This project took huge inspiration from rayriffy/elysia-rate-limit and express-rate-limit/rate-limit-redis
// Make sure to star these projects and send them a thank you.

// TODO: add debug logs

export { plugin as ThrottleGuard } from "./services/plugin";
export { defaultOptions } from "./defaults/default_options";
export { RedisContext } from "./defaults/redis_context";

export type { Context } from "./@types/context";
export type { Options } from "./@types/options";
export type { Generator } from "./@types/generator";
