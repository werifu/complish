// inspired by https://github.com/cs-au-dk/jelly/blob/master/src/misc/logger.ts
import winston from "winston";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const WHITE = "\x1b[37m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const CLEAR = "\u001b[0K";

const colors: {
  [key: string]: string
} = {
  error: RED,
  warn: YELLOW,
  info: WHITE,
  verbose: GREEN,
  debug: CYAN,
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(({ level, message }) =>
    colors[level] + message + RESET + CLEAR),
  transports: new winston.transports.Console({
    stderrLevels: [] // change to ["error"] to direct error messages to stderr
  })
});

export default logger;

export function setLogLevel(level: string) {
  logger.level = level;
}