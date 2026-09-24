import { info } from "console";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const devQALog = !import.meta.env.NODE_ENV === ("production" || "staging");
const productionLogInfoOff =
  import.meta.env.NODE_ENV === ("production" || "staging") &&
  !import.meta.env.INFO_LOG &&
  import.meta.env.INFO_LOG === "OFF";

const level = devQALog ? "debug" : productionLogInfoOff ? "error" : "info";

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
    format.errors({ stack: true }),
    format.splat()
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d"
    })
  ]
});

export { logger };
