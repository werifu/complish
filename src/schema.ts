import { z } from 'zod';
const SubCmd = z.object({
  name: z.string(),
  description: z.string().optional(),
  alias: z.array(z.string()).optional(),
});

const Arg = z.object({
  name: z.string(),
  description: z.string().optional(),
});

const Opt = z.object({
  short: z.string().optional(),
  long: z.string().optional(),
  argument: z.string().optional(),
  description: z.string().optional(),
});

export type UsageT = z.infer<typeof Usage>;
export const Usage = z.object({
  subcommands: z.array(SubCmd),
  arguments: z.array(Arg),
  options: z.array(Opt),
});
