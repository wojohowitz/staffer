import winston from 'winston';
import expressWinston from 'express-winston';


export { AppLogger };

function AppLogger() {
  return expressWinston.logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
      }),
    ],
  });
}
