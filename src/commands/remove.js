const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const parser = require('./../parser');
const IcmError = require('./../error')

module.exports = async function({ config, bookPath, name }) {
  if (!name) {
    const message = 'Missing pattern name';
    throw new IcmError(message);
  }

  const bookContents = await fs.readFileAsync(bookPath);
  const book = JSON.parse(bookContents);

  const patternIndex = book.patterns.findIndex(pattern => {
    return pattern.name === name;
  });

  if (patternIndex === -1) {
    throw new IcmError(`Pattern ${chalk.bold(name)} is not found`);
  }

  book.patterns.splice(patternIndex, 1);
  await fs.writeFileAsync(bookPath, JSON.stringify(book, null, 2) + '\n');
  return true;
};
