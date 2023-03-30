import { z } from 'zod';

export interface SubCmdT {
  name: string;
  description?: string;
  alias?: string[];
  usage?: UsageT;
}

export type ArgT = z.infer<typeof Arg>;
const Arg = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type OptT = z.infer<typeof Opt>;
const Opt = z.object({
  short: z.string().optional(),
  long: z.string().optional(),
  argument: z.string().optional(),
  description: z.string().optional(),
});

export type UsageT = {
  subcommands: SubCmdT[];
  arguments: ArgT[];
  options: OptT[];
};

export const Usage: z.ZodType<UsageT> = z.object({
  subcommands: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    alias: z.array(z.string()).optional(),
    usage: z.lazy(() => Usage).optional(),
  })),
  arguments: z.array(Arg),
  options: z.array(Opt),
});
