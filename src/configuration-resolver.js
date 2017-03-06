const { homedir } = require('os');
const { resolve } = require('path');
const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const mkdirp = promisifyAll(require('mkdirp'));
const chalk = require('chalk');
const IcmError = require('./error');
const constants = require('./constants');

module.exports = async function ({ configPath, bookPath }) {
  let resolvedConfigPath;
  let resolvedBookPath;

  const icmHomeConfigDir = process.env.ICM_CONFIG_DIR || resolve(homedir(), '.icm');

  if (configPath) {
    resolvedConfigPath = resolve(configPath);
    try {
      await fs.statAsync(resolvedConfigPath);
    } catch (err) {
      throw new IcmError(`${chalk.dim(resolvedConfigPath)} doesn't exist`);
    }
  }

  if (bookPath) {
    resolvedBookPath = resolve(bookPath);
    try {
      await fs.statAsync(resolvedBookPath);
    } catch (err) {
      throw new IcmError(`${chalk.dim(resolvedBookPath)} doesn't exist`);
    }
  }

  // find icm book in the current directory
  if (!resolvedBookPath) {
    try {
      const currentDirectoryIcmBook = resolve(process.cwd(), '.icmbook');
      await fs.statAsync(currentDirectoryIcmBook);
      resolvedBookPath = currentDirectoryIcmBook;
    } catch (err) {
      // noop
    }
  }

  try {
    await fs.statAsync(icmHomeConfigDir);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw new Error(err);
    }

    // probably using try...catch inside catch is antipattern, but I calmed after reading next link
    // http://softwareengineering.stackexchange.com/questions/118788/is-using-nested-try-catch-blocks-an-anti-pattern
    try {
      await mkdirp(icmHomeConfigDir);
    } catch (err) {
      throw new Error(err);
    }
  }

  if (!resolvedConfigPath) {
    resolvedConfigPath = resolve(icmHomeConfigDir, 'config');
    try {
      await fs.statAsync(resolvedConfigPath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error(err);
      }

      try {
        await fs.writeFileAsync(resolvedConfigPath, JSON.stringify(constants.defaultConfig, null, 2) + '\n');
      } catch (err) {
        throw new Error(err);
      }
    }
  }

  if (!resolvedBookPath) {
    resolvedBookPath = resolve(icmHomeConfigDir, 'book');
    try {
      await fs.statAsync(resolvedBookPath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error(err);
      }

      try {
        await fs.writeFileAsync(resolvedBookPath, JSON.stringify(constants.defaultBook, null, 2) + '\n');
      } catch (err) {
        throw new Error(err);
      }
    }
  }

  return {
    config: resolvedConfigPath,
    book: resolvedBookPath
  };
};
