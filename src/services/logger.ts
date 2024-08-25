import debug from "debug";

export const logger = (
  unit: string,
  formatter: unknown,
  ...params: unknown[]
) => debug(`elysia-throttle-guard: ${unit}`)(formatter, ...params);
