const meow = require('meow');
const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const help = require('./help');
const configurationResolver = require('./configuration-resolver');
const IcmError = require('./error');
const add = require('./commands/add');

async function run() {
  const cli = meow({
    description: false,
    help
  }, {
    alias: {
      c: 'config',
      b: 'book',
      y: 'yes'
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
    case 'add': {
      const pattern = cli.input[1];

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

      let message = `${chalk.green('✓')} Pattern "${chalk.dim(result.pretty)}" succesfully added.\n`;
      message += `${chalk.green('>')} Use "icm run ${chalk.bold(result.name)}" to execute pattern`;
      console.log(message);
      break;
    }
    default: {
      throw new IcmError(`Command ${chalk.bold(command)} not found`);
    }
  }
}

run()
.catch(err => {
  if (err instanceof IcmError) {
    console.error(`${chalk.bold.red('error')} ${err.message}`);
  } else {
    console.error(err);
  }
});
