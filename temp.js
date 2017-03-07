// \$\{([^{}]*|\{([^{}]*|\{[^{}]*\})*\})*\}
// jq '.dependencies, .devDependencies | keys | .[]' package.json
const meow = require('meow');
const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const chalk = require('chalk');
const Icm = require('./');

inquirer.registerPrompt('autocomplete', autocomplete);

const cmd = 'curl -X${Method[POST,GET,PUT,PATH,DELETE]} -H "Content-type: application/json" -d "{\"firstName\": \"${First name}\",\"lastName\": \"${Last name}\"}" "localhost:3000/user"';
const rx = /\$\{([^{}]*|\{([^{}]*|\{[^{}]*\})*\})*\}/g;

const start = async () => {
  const r = cmd.match(rx);

  const parsed = r.map(item => {
    const out = {};
    out.original = item;

    let name = item.substring(2).slice(0, -1)
    const isHasEnums = name.includes('[') && name.includes(']');

    if (isHasEnums) {
      out.enums = name.slice(name.indexOf('[') + 1, name.lastIndexOf(']')).split(',');
      name = name.slice(0, name.indexOf('['));
    }

    out.name = name;
    out.result = '';

    return out;
  });

  for (let i in parsed) {
    const item = parsed[i];
    const answer = await inquirer.prompt({
      type: item.enums ? 'autocomplete' : 'input',
      message: `${item.name}:`,
      name: 'result',
      source: function(answersSoFar, input) {
        if (!input) {
          input = '';
        }
        return new Promise(resolve => {
          const filtered = item.enums.filter(en => {
            return en.toLowerCase().startsWith(input.toLowerCase());
          });

          resolve(filtered);
        });
      }
    });

    item.result = answer.result;
  }

  let finalCmd = cmd;
  parsed.forEach(item => {
    finalCmd = finalCmd.replace(item.original, item.result);
    finalCmd = finalCmd.replace(`${item.name}`, item.result);
  });

  console.log(chalk.green('>') + ' ' + finalCmd);

};

try {
  start().then(() => {}).catch(err => console.log(err));
} catch (err) {
  console.log(err);
}
