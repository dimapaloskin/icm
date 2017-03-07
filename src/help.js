const chalk = require('chalk');
const pkg = require('./../package.json');

const help = `

  Usage: ${chalk.bold('icm')} <command> [attribute] [options]

  ${chalk.dim.bold('Available commands:')}

    ${chalk.bold('add')}          [pattern] [--name]         add new pattern
    ${chalk.bold('remove')}       [name]                     remove pattern
    ${chalk.bold('run | r')}      [name] [-p "key=value"]    fill and execute the pattern
    ${chalk.bold('list | ls')}    [matcher]                  print pattern(s). wildcard supported
    ${chalk.bold('new-book')}     [name]                     create new book in the current directory
    ${chalk.bold('i')}                                       start interactive mode
    ${chalk.bold('help')}                                    Display help

  ${chalk.dim.bold('Available options:')}

    ${chalk.bold('-c')}                   path to configuration file
    ${chalk.bold('-p property=value')}    set property value for driven pattern
    ${chalk.bold('-b')}                   path to patterns book

  ${chalk.bold('icm')}@${pkg.version}

`;

module.exports = help;
