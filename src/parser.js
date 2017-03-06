const chalk = require('chalk');

const rx = /@\{([^{}]*|\{([^{}]*|\{[^{}]*\})*\})*\}/g;
function getExpressions(pattern) {
  return pattern.match(rx);
}

function highlightExpressions(pattern) {
  const expressions = getExpressions(pattern);
  if (!expressions) {
    return pattern;
  }

  let finalString = pattern;

  expressions.forEach(expression => {
    finalString = finalString.replace(expression, chalk.cyan.bold(expression));
  });

  return finalString;
}

function transform(pattern) {
  return pattern;
}

module.exports = {
  getExpressions,
  highlightExpressions,
  transform
};
