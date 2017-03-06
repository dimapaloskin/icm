const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const parser = require('./../parser');
const IcmError = require('./../error');

module.exports = async function({ config, bookPath, pattern, name, force }) {

  if (!pattern) {
    const message = `Missing pattern\n      Usage: icm add ${chalk.bold('pattern')}`;
    throw new IcmError(message);
  }

  if (!name) {
    const message = 'Missing pattern name';
    throw new IcmError(message);
  }

  const bookContents = await fs.readFileAsync(bookPath);
  const book = JSON.parse(bookContents);

  const existsPatternIndex = book.patterns.findIndex(bookPattern => {
    return bookPattern.name === name;
  });

  if (existsPatternIndex !== -1) {

    if (!force) {
      const overwrite = await inquirer.prompt({
        type: 'confirm',
        message: `Pattern "${name}" exists. Overwrite?`,
        name: 'result',
        default: false
      });

      if (!overwrite.result) {
        return false;
      }
    }

    book.patterns.splice(existsPatternIndex, 1);
  }

  const formattedPattern = parser.highlightExpressions(pattern);

  const data = {
    pattern,
    name
  };

  book.patterns.push(data);
  await fs.writeFileAsync(bookPath, JSON.stringify(book, null, 2) + '\n');
  data.pretty = formattedPattern;
  return data;
};
