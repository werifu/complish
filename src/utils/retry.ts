import logger from "../logger";

async function sleep(millisecond: number) {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(null);
    }, millisecond);
  })
}

/**
 * 
 * @param fn the task, remember to prepare a closure if it needs args
 * @param maxTimes max try times
 * @param delay millisecond
 * @returns 
 */
export async function retry<T>(fn: () => Promise<T>, maxTimes = 5, delay = 1000) {
  for (let i = 0; i < maxTimes; i++) {
    try {
      return await fn();
    } catch (e) {
      logger.debug(`Task failed in the ${i + 1} attempt; error: ${e}; retry delay: ${delay} ms.`);
      await sleep(delay);
    }
  }
  throw Error(`Unable to finish the task in ${maxTimes} attempts, please retry by hand.`);
}