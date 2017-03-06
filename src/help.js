const chalk = require('chalk');
const pkg = require('./../package.json');

const help = `

  Usage: ${chalk.bold('icm')} <command>

  ${chalk.bold('Available commands:')}

    ${chalk.bold('add')}                add new pattern
    ${chalk.bold('remove')}             remove pattern
    ${chalk.bold('run')}                fill and execute the pattern
    ${chalk.bold('print')}              fill and print the pattern
    ${chalk.bold('all')}                print all patterns
    ${chalk.bold('i')}                  start interactive mode
    ${chalk.bold('new-book')}           create new book in the current directory

  ${chalk.bold('Available options:')}

    ${chalk.bold('-c')}                 path to configuration file
    ${chalk.bold('-p property=value')}  set property value for driven pattern
    ${chalk.bold('-b')}                 path to patterns file

  ${chalk.bold('icm')}@${pkg.version}

`;

module.exports = help;
