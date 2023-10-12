import { EventEmitter } from 'events';

class LoggerEvents extends EventEmitter {
  debug(message: string): void {
    this.emit('DEBUG', message);
  }

  info(message: string): void {
    this.emit('INFO', message);
  }

  warn(message: string): void {
    this.emit('WARN', message);
  }

  error(message: string): void {
    this.emit('ERROR', message);
  }
}

export const loggerEvents = new LoggerEvents();
