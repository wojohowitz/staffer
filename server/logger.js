import winston from 'winston';
import expressWinston from 'express-winston';


export { AppLogger, ErrorLogger };

function AppLogger() {
  return expressWinston.logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
      }),
    ],
  });
}

function ErrorLogger() {
  return expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        colorize: true,
      }),
    ]
  });
}
