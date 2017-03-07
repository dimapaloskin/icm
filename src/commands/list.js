const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const parser = require('./../parser');
const IcmError = require('./../error');
const mm = require('micromatch');

module.exports = async function({ config, bookPath, name }) {

  const bookContents = await fs.readFileAsync(bookPath);
  const { patterns } = JSON.parse(bookContents);

  const matcher = name || '*';

  const filtered = patterns.filter(pattern => {
    return mm.isMatch(pattern.name, matcher, { dot: true })
  });

  return filtered;
};
