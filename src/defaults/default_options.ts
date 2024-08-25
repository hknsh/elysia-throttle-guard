import type { Options } from "../@types/options";
import { defaultGenerator } from "./default_generator";

export const defaultOptions: Omit<Options, "context"> = {
  duration: 60000,
  max: 10,
  response: { message: "Enhance your calm" },
  scope: "global",
  store: "memory",
  countFailedRequest: false,
  generator: defaultGenerator,
  headers: true,
  skip: () => false,
};
