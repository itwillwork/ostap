const fakeLogger = {
  log: () => {},
  error: () => {},
  warn: () => {},
};

class Logger {
  constructor() {
    this._defaultStrategy = fakeLogger;
  }

  setStrategy(options) {
    if (options.viewFullLogs) {
      this._strategy = console;
    } else {
      this._strategy = fakeLogger;
    }
  }

  getStrategy() {
    return this._strategy || this._defaultStrategy;
  }

  log(...args) {
    return this.getStrategy().log(...args);
  }

  error(...args) {
    return this.getStrategy().error(...args);
  }

  warn(...args) {
    return this.getStrategy().warn(...args);
  }
}

module.exports = Logger;
