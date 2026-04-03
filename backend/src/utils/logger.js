/**
 * Systeme de logging simple et efficace
 * Logs colores dans la console avec horodatage
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Formater la date et l'heure
 */
function timestamp() {
  const now = new Date();
  return now.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Logger avec niveaux
 */
const logger = {
  info: (message, ...args) => {
    console.log(`${colors.blue}[INFO]${colors.reset} ${timestamp()} - ${message}`, ...args);
  },

  success: (message, ...args) => {
    console.log(`${colors.green}[OK]${colors.reset} ${timestamp()} - ${message}`, ...args);
  },

  warning: (message, ...args) => {
    console.log(`${colors.yellow}[WARN]${colors.reset} ${timestamp()} - ${message}`, ...args);
  },

  error: (message, ...args) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${timestamp()} - ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.cyan}[DEBUG]${colors.reset} ${timestamp()} - ${message}`, ...args);
    }
  }
};

module.exports = logger;