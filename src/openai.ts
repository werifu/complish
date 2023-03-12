import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from 'openai';
import { exit } from 'process';
import logger from './logger';
import { Usage, UsageT } from './schema';
import { safeJsonParse } from './utils/safeParse';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const systemPrompt = `
extract all subcommands and options in the text I will send you later and translate it into json with a format like the following:
\`\`\`text
Usage:
  stringer inspect [flags] [NAME]
Aliases:
  inspect, insp
Subcommands:
  subcmd2   some description
Flags:
  -c, --config <FILE>  Sets a custom config file
\`\`\`
will be translated to be
\`\`\`json
{
  "subcommands": [
    {
      "name": "subcmd2",
      "description": "some description",
    }
  ],
  "arguments": [
    {
      "name": "[NAME]",
      "description": ""
    }
  ],
  "options": [
    {
      "short": "-c",
      "long": "--config",
      "argument": "<FILE>",
      "description": "Sets a custom config file"
    },
  ]
}
\`\`\`
Note that 'Aliases' are not Subcommands, IGNORE them.
Besides, you should also ignore the current subcommand if any,
for example, the usage above \`stringer inspect\` should not be handled as subcommand in your response since it refers to the current subcommand being executed.
If there is no options, subcommands or arguments, you should set it as empty array [] instead of undefined.
`;

export async function askChatGPT(helpText: string) {
  const question = generatePrompt(helpText);
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: question,
    },
  ];
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });
    return completion.data.choices[0].message?.content || '';
  } catch (e: any) {
    if (e.isAxiosError) {
      if (e.response?.status === 400) {
        // request not allowed
        const msg = `status code 400. ${e.response?.data?.error?.message}`;
        logger.error(msg);
        throw Error(msg);
      } else if (e.response.status === 429) {
        // api rate limit, ignore and wait for retrying
        logger.debug(`status code 429. ${e.response?.data?.error?.message}`)
      }
    }
    throw Error(e);
  }
}

function generatePrompt(prompt: string): string {
  return `The following is the help page text:\n${prompt}`;
}

/**
 * structure the help page via chatGPT
 * @param text help page text
 * @returns structed infomation of the help page text
 */
export async function parseHelpText(text: string): Promise<UsageT> {
  const answer = await askChatGPT(text);
  const re = /.*\`\`\`[json]*([\s\S]+)\`\`\`.*/;
  const caught = re.exec(answer);
  if (!caught || caught.length <= 1) {
    const err = `Fail to catch json code from chatGPT's answer:\n${answer}`;
    logger.debug(err);
    throw Error(err);
  }

  const jsonStr = caught[1];
  const parsedJsonRes = safeJsonParse(jsonStr);
  if (!parsedJsonRes.success) {
    const err = `Fail to parse json from json code: ${parsedJsonRes.str}`;
    logger.debug(err);
    throw Error(err);
  }
  const res = Usage.safeParse(parsedJsonRes.data);
  if (!res.success) {
    const err = `Fail to parse json to type UsageT; json code: ${jsonStr}`;
    logger.debug(err);
    throw Error(err);
  }

  logger.debug(`Successfully parse the json code in answer: ${JSON.stringify(res.data)}`,);
  return res.data;
}

export function makeFnParseHelpText(text: string) {
  return async () => {
    return parseHelpText(text);
  }
}