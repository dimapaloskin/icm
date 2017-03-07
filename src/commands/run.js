
const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const execa = require('execa');
const readline = require('readline');
const parser = require('./../parser');
const IcmError = require('./../error');

module.exports = async function({ config, bookPath, name, verbose, properties = []}) {

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

  if (properties && !Array.isArray(properties)) {
    properties = [properties];
  }

  let validProps = properties.filter(properties => {
    return properties.includes('=');
  });

  const props = {};
  validProps.forEach(prop => {
    const eqFirstIndex = prop.indexOf('=');
    const key = prop.substr(0, eqFirstIndex);
    const value = prop.substr(eqFirstIndex + 1);

    props[key] = value;
  });

  for (let i in transformed) {
    const expression = transformed[i];

    if (props.hasOwnProperty(expression.name)) {
      expression.result = props[expression.name];
    } else {
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
      props[expression.name] = answer.result;
    }
  }

  let finalCmd = pattern.pattern;
  transformed.forEach(item => {
    finalCmd = finalCmd.split(item.original).join(item.result);
    finalCmd = finalCmd.split(`%{${item.name}}`).join(item.result);
  });

  const cmd = execa.shell(finalCmd);
  cmd.then(() => {}).catch(() => {});
  cmd.stdin.pipe(process.stdin);
  cmd.stderr.pipe(process.stderr);
  cmd.stdout.pipe(process.stdout);
}
