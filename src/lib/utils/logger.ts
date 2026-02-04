export type LogMeta = Record<string, unknown> | undefined;

function timestamp() {
  return new Date().toISOString();
}

function format(level: string, message: string, meta?: LogMeta) {
  const payload: Record<string, unknown> = {
    ts: timestamp(),
    level,
    message,
    ...(meta && { meta })
  };
  return JSON.stringify(payload);
}

export const logger = {
  info: (message: string, meta?: LogMeta) => {
    console.info(format('info', message, meta));
  },
  warn: (message: string, meta?: LogMeta) => {
    console.warn(format('warn', message, meta));
  },
  error: (message: string, meta?: LogMeta) => {
    console.error(format('error', message, meta));
  }
};
