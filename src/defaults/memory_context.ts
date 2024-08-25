import { LRUCache } from "lru-cache";
import type { Context } from "../@types/context";
import type { Options } from "../@types/options";

interface StoreType {
  count: number;
  nextReset: Date;
}

/** Default in-memory cache with LRUCache */
export class MemoryContext implements Context {
  private readonly maxSize: number;
  private store!: LRUCache<string, StoreType>;
  private duration!: number;

  public constructor(maxSize = 5000) {
    this.maxSize = maxSize;
  }

  public init(options: Options) {
    this.duration = options.duration;
    this.store = new LRUCache<string, StoreType>({
      max: this.maxSize,
    });
  }

  public async increment(key: string) {
    const now = new Date();
    let item = this.store.get(key);

    if (item === undefined || item.nextReset < now) {
      item = {
        count: 1,
        nextReset: new Date(now.getTime() + this.duration),
      };
    }

    item.count++;

    this.store.set(key, item);

    return item;
  }

  public async decrement(key: string) {
    const item = this.store.get(key);
    if (item !== undefined) {
      item.count--;
      this.store.set(key, item);
    }
  }

  public async reset(key?: string) {
    if (typeof key === "string") {
      this.store.delete(key);
    }
    this.store.clear();
  }

  public kill() {
    this.store.clear();
  }
}
