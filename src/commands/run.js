
const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const execa = require('execa');
const parser = require('./../parser');
const IcmError = require('./../error');

module.exports = async function({ config, bookPath, name }) {

  if (!name) {
    const message = `Missing pattern name\n      Usage: icm run ${chalk.bold('name')}`;
    throw new IcmError(message);
  }

  const bookContents = await fs.readFileAsync(bookPath);
  const book = JSON.parse(bookContents);

  const pattern = book.patterns.find(item => {
    return item.name === name;
  });

  if (!pattern) {
    throw new IcmError(`Pattern ${chalk.bold(name)} is not found`);
  }

  await parser.validate(pattern.pattern);
  const transformed = parser.transform(pattern.pattern);

  for (let i in transformed) {
    const expression = transformed[i];

    let enums = [];
    if (expression.isExecutable) {
      let execResult;
      try {
        const { stdout } = await execa.shell(expression.enums);
        execResult = stdout;
      } catch (err) {
        throw new Error(err);
      }

      enums = execResult.split('\n').map(Function.prototype.call, String.prototype.trim);
    } else {
      enums = expression.enums;
    }

    const answer = await inquirer.prompt({
      type: expression.enums ? 'list' : 'input',
      message: `${expression.name}:`,
      name: 'result',
      choices: enums
    });

    expression.result = answer.result;
  }

  let finalCmd = pattern.pattern;
  transformed.forEach(item => {
    finalCmd = finalCmd.replace(item.original, item.result);
    finalCmd = finalCmd.replace(`${item.name}`, item.result);
  });

  const cmd = execa.shell(finalCmd);
  cmd.then(() => {}).catch(() => {});
  cmd.stdin.pipe(process.stdin);
  cmd.stderr.pipe(process.stderr);
  cmd.stdout.pipe(process.stdout);
}
