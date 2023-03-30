import { UsageT } from "../schema";

export function defaultUsage(): UsageT {
  return {
    subcommands: [],
    arguments: [],
    options: [],
  };
}