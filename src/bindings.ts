import { EventEmitter } from 'events';

class Logger extends EventEmitter {
  debug(message: string): void {
    this.emit('log', { level: 'debug', message });
  }

  info(message: string): void {
    this.emit('log', { level: 'info', message });
  }

  warn(message: string): void {
    this.emit('log', { level: 'warn', message });
  }

  error(message: string): void {
    this.emit('log', { level: 'error', message });
  }

  subscribe(callback: (event: { level: string, message: string }) => void): void {
    this.on('log', callback);
  }
}

export function getLogger(): Logger {
  return new Logger();
}
