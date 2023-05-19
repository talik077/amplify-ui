const fs = require('fs');

const sleep = (seconds) => {
  const milliseconds = seconds * 1000;
  const start = new Date().getTime();
  while (true) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
};

const log = (type, message) => {
  const colors = {
    blueBold: '\x1b[1;36m',
    greenBold: '\x1b[1;32m',
    redBold: '\x1b[1;31m',
    yellowBold: '\x1b[1;33m',
    colorEnd: '\x1b[0m',
  };
  switch (type) {
    case 'warning':
      console.warn(
        `${colors.yellowBold}[WARNING...] ${message}${colors.colorEnd}`
      );
      break;
    case 'error':
      console.error(`${colors.redBold}[ERROR...] ${message}${colors.colorEnd}`);
      break;
    case 'success':
      console.log(
        `${colors.greenBold}[SUCCESS...] ${message}${colors.colorEnd}`
      );
      break;
    case 'command':
      console.log(`${colors.blueBold}[RUN...] ${message}${colors.colorEnd}`);
      break;
    case 'info':
      console.log(`${colors.blueBold}[INFO...] ${message}${colors.blueEnd}`);
      break;
    default:
      console.log(message);
      break;
  }
};

/**
 * checkStartMessage is a function that checks if the log file ONLY contains the starting message
 * If the log file ONLY contains the starting message, it means that the logging messages are not ready yet
 */
const checkStartMessage = (colors, logLines, logFile) => {
  const startMessages = [
    'info Starting logkitty',
    'React Native iOS Logger started for XCode project',
  ];

  log('info', 'Checking log file for start messages...');
  if (logLines.length === 1) {
    for (const startMessage of startMessages) {
      if (logLines[0].includes(startMessage)) {
        log(
          'error',
          'Failed to get the logging messages. Please increase TIME_TO_WAIT.'
        );
        log('info', 'Log file:');
        log('log', logFile);
        process.exit(1);
      }
    }
  }
};

/**
 * checkErrorMessage is a function that checks if there is an error in the log file
 * @returns {boolean} hasError
 */
const checkErrorMessage = (colors, logLines) => {
  log('info', `Checking log file ${process.env.LOG_FILE} for errors...`);

  let hasError = false;
  for (const line of logLines) {
    let isErrorLine = false;
    const errorKeyWords = [
      'Error',
      'ERROR',
      'fail',
      'Could not connect to development server',
    ];
    const errorRegex = `(([0-9]{2}:){2}[0-9]{2},?).*(${errorKeyWords.join(
      '|'
    )})`;

    if (line.match(errorRegex)) {
      log('error', 'Error found:');
      log('error', line);
      isErrorLine = true;
    }

    // Exceptions are errors that are not really errors
    const exceptions = ['AuthError -'];
    for (const exception of exceptions) {
      if (line.includes(exception)) {
        console.warn(`${colors.yellowBold}Exception found:${colors.colorEnd}`);
        console.warn(line);
        isErrorLine = false;
        break;
      }
    }
    hasError = hasError || isErrorLine;
  }
  return hasError;
};

const checkReactNativeLog = () => {
  log(
    'command',
    `cd build-system-tests/mega-apps/${process.env.MEGA_APP_NAME}`
  );
  process.chdir(`build-system-tests/mega-apps/${process.env.MEGA_APP_NAME}`);

  // Wait for the logging messages to be ready. The number is based on real experiments in Github Actions.
  let timeToWait = process.env.PLATFORM === 'ios' ? 300 : 200;

  log('info', `Sleep for'${timeToWait}'seconds...`);
  sleep(timeToWait);

  const logFile = fs.readFileSync(process.env.LOG_FILE, 'utf-8');
  const logLines = logFile.split('\n').filter((line) => line !== '');

  checkStartMessage(colors, logLines, logFile);

  let hasError = checkErrorMessage(colors, logLines);

  if (hasError) {
    log('error', `Errors found in log file ${process.env.LOG_FILE}`);
    log('info', 'Log file:');
    log('log', logFile);
    process.exit(1);
  } else if (logFile === '') {
    log('error', `Log file ${process.env.LOG_FILE} is empty.`);
    log('info', 'Full log:');
    log('log', logFile);
    process.exit(1);
  }

  log('info', 'Full log:');
  log('log', logFile);
  log('success', `No errors found in log file ${process.env.LOG_FILE}`);

  process.exit(0);
};

checkReactNativeLog();
