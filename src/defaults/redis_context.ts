import type { Context } from "../@types/context";
import type { Options } from "../@types/options";

interface RedisClient {
  sendCommand(...args: unknown[]): Promise<unknown>; // ... i really hate ioredis for this.
}

/** Default context for Redis storage */
export class RedisContext implements Context {
  private client: RedisClient;
  private duration!: number;
  private prefix?: string;

  constructor(client: RedisClient) {
    this.client = client;
  }

  public init(options: Options): void {
    this.duration = options.duration;
    this.prefix = options.prefix ?? "rl:";
  }

  public async increment(key: string) {
    const now = Date.now();
    const ttlKey = `${key}:ttl`;

    const countResult = await this.client.sendCommand(
      "GET",
      this.prefixKey(key),
    );
    const ttlResult = await this.client.sendCommand("GET", ttlKey);

    let count = countResult ? Number.parseInt(countResult as string, 10) : 0;
    let nextReset = ttlResult
      ? Number.parseInt(ttlResult as string, 10)
      : now + this.duration;

    if (!countResult || now >= nextReset) {
      count = 1;
      nextReset = now + this.duration;

      await this.client.sendCommand("SET", ttlKey, nextReset.toString());
      await this.client.sendCommand(
        "EXPIRE",
        this.prefixKey(key),
        (this.duration / 1000).toString(),
      );
    } else {
      count++;
    }

    await this.client.sendCommand("SET", this.prefixKey(key), count.toString());

    return {
      count,
      nextReset: new Date(nextReset),
    };
  }

  public async decrement(key: string) {
    await this.client.sendCommand("DECR", this.prefixKey(key));
  }

  public async reset(key: string) {
    await this.client.sendCommand("DEL", this.prefixKey(key));
    await this.client.sendCommand("DEL", `${key}:ttl`);
  }

  public kill() {}

  private prefixKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
