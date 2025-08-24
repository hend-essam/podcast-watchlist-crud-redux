const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const getTimestamp = () => {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
};

const logger = {
  info: (message) => {
    console.log(
      `${colors.cyan}[INFO]${colors.reset} ${getTimestamp()} - ${message}`
    );
  },
  error: (message) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${getTimestamp()} - ${message}`
    );
  },
  warn: (message) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${getTimestamp()} - ${message}`
    );
  },
  debug: (message) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `${colors.magenta}[DEBUG]${colors.reset} ${getTimestamp()} - ${message}`
      );
    }
  },
  success: (message) => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${getTimestamp()} - ${message}`
    );
  },
};

module.exports = logger;
