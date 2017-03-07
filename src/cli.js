#!/usr/bin/env node

const meow = require('meow');
const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const help = require('./help');
const configurationResolver = require('./configuration-resolver');
const IcmError = require('./error');
const parser = require('./parser');
const add = require('./commands/add');
const run = require('./commands/run');
const remove = require('./commands/remove');
const list = require('./commands/list');

async function runIcm() {
  const cli = meow({
    description: false,
    help
  }, {
    alias: {
      c: 'config',
      b: 'book',
      y: 'yes',
      p: 'property'
    }
  });

  const command = cli.input[0];
  if (!command) {
    cli.showHelp();
    process.exit(0);
  }


  const paths = await configurationResolver({
    configPath: cli.flags.config,
    bookPath: cli.flags.book
  });

  const configContents = await fs.readFileAsync(paths.config);
  const config = JSON.parse(configContents);

  switch (command) {
    case 'help': {
      cli.showHelp();
      break;
    }

    case 'add': {
      let pattern = cli.input[1];

      if (!pattern || typeof pattern !== 'string') {
        const result = await inquirer.prompt({
          message: 'Pattern:',
          name: 'pattern'
        });
        pattern = result.pattern;
      }

      let name = cli.flags.name;
      if (!name || typeof name !== 'string') {
        const result = await inquirer.prompt({
          message: 'Pattern name:',
          name: 'name'
        });
        name = result.name;
      }

      const result = await add({
        config,
        bookPath: paths.book,
        pattern,
        name,
        force: cli.flags.y
      });

      if (!result) {
        return;
      }

      let message = `${chalk.cyan('✓')} Pattern "${chalk.dim(result.pretty)}" successfully added with name "${chalk.bold(name)}"\n`;
      message += `${chalk.cyan('>')} Use "icm run ${chalk.bold(result.name)}" to execute pattern`;
      console.log(message);
      break;
    }

    case 'r':
    case 'run': {
      const name = cli.input[1];
      await run({
        config,
        bookPath: paths.book,
        name,
        properties: cli.flags.property
      });
      break;
    }

    case 'rm':
    case 'remove': {
      const name = cli.input[1];
      const result = await remove({
        config,
        bookPath: paths.book,
        name
      });

      if (!result) {
        return;
      }

      let message = `${chalk.cyan('✓')} Pattern ${chalk.bold(name)} was removed`;
      console.log(message);
      break;
    }

    case 'ls':
    case 'list': {
      const name = cli.input[1];
      const result = await list({
        config,
        bookPath: paths.book,
        name
      });

      let maxNameLength = result.reduce((accum, pattern) => {
        if (pattern.name.length > accum) {
          accum = pattern.name.length;
        }

        return accum;
      }, 0);

      console.log(`${chalk.cyan('✓')} ${result.length} patterns found`);

      if (result.length) {
        console.log('');
        const nameString = 'Name:';
        const headerSpacingLength = 6 + maxNameLength - nameString.length;
        const headerSpacing = Array(headerSpacingLength).join(' ');
        console.log(`${chalk.dim('  Name:')} ${headerSpacing} ${chalk.dim('Pattern:')}\n`);

        result.forEach(pattern => {
          const spacingLength = 6 + maxNameLength - pattern.name.length;
          const spacing = Array(spacingLength).join(' ');
          console.log(`  ${chalk.bold.cyan(pattern.name)} ${spacing} ${parser.highlightExpressions(pattern.pattern)}`);
        });
        console.log('');
      }

      break;
    }

    default: {
      throw new IcmError(`Command ${chalk.bold(command)} not found`);
    }
  }
}

runIcm()
.catch(err => {
  if (err instanceof IcmError) {
    console.error(`${chalk.bold.red('Error')} ${err.message}`);
  } else {
    console.error(err);
  }
});
