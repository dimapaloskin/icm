const chalk = require('chalk');
const isNumber = require('is-number');
const IcmError = require('./error');

const strRx = /%\{([^{}]*|\{([^{}]*|\{[^{}]*\})*\})*\}/g;

function getExpressions(pattern) {
  const result = pattern.match(strRx);
  if (!result) {
    return [];
  }

  return result;
}

function highlightExpressions(pattern) {
  const expressions = getExpressions(pattern);
  if (!expressions) {
    return pattern;
  }

  let finalString = pattern;

  expressions.forEach(expression => {
    finalString = finalString.split(expression).join(chalk.magenta.bold(expression));
  });

  return finalString;
}

function transform(pattern) {
  const expressions = getExpressions(pattern);
  const transformed = expressions.map(expression => {
    const out = {
      result: undefined,
      name: undefined
    };

    out.original = expression;

    let name = expression.substring(2).slice(0, -1);
    const isHasEnums = name.includes('[') && name.includes(']');

    if (isHasEnums) {
      let isExecutable = false;
      if (name[name.indexOf('[') - 1] === '$') {
        isExecutable = true;
      }

      const sliced = name.slice(name.indexOf('[') + 1, name.lastIndexOf(']'));
      if (isExecutable) {
        out.enums = sliced;
        out.isExecutable = true;
      } else {
        out.enums = sliced.split(',').map(Function.prototype.call, String.prototype.trim);
      }

      name = name.slice(0, name.indexOf('['));
      if (isExecutable) {
        name = name.slice(0, -1);
      }
    }

    out.name = name;

    return out;
  });

  return transformed;
}

async function validate(pattern) {
  const transformed = transform(pattern);
  transformed.forEach(expression => {
    const firstNameCharacter = expression.name[0];
    const lastNameCharacter = expression.name[expression.name.length - 1];
    if (isNumber(firstNameCharacter)) {
      throw new IcmError(`${chalk.bold(expression.original)} - expression name can not begin with a number`);
    }

    // needed for features
    const reservedSymbols = ['!', '@', '%', '#', '^', '&', '*'];
    const joinedReservedSymbols = reservedSymbols.join(',');
    if (reservedSymbols.includes(firstNameCharacter)) {
      throw new IcmError(`${chalk.bold(expression.original)} - expression name can not begin with reserved symbols ${joinedReservedSymbols}`);
    }

    if (reservedSymbols.includes(lastNameCharacter)) {
      throw new IcmError(`${chalk.bold(expression.original)} - expression name can not end in reserved symbols ${joinedReservedSymbols}`);
    }
  });
}

module.exports = {
  getExpressions,
  highlightExpressions,
  transform,
  validate
};
