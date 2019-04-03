#!/usr/bin/env node

'use strict';

const cac = require('cac');
const fs = require('fs');
const chalk = require('chalk');
const ostap = require('./src');

const Confirm = require('prompt-confirm');

const pkg = require('./package.json');

const DEFAULT_OPTIONS = {
  useCache: true,
  viewFullLogs: false,
  printSourceTreeDuplicates: false,
  printOptimalTreeDuplicates: false,
};

const run = async (file, options) => {
  try {
    await fs.accessSync(file, fs.constants.R_OK);
  } catch (error) {
    throw 'no access for read, file: ' + file;
  }

  let treeRoot = {};

  try {
    treeRoot = JSON.parse(fs.readFileSync(file));
  } catch (error) {
    throw 'parse error file ' + file + '\n' + error;
  }

  let optimalTree = null;
  try {
    optimalTree = await ostap(treeRoot, options);
  } catch (error) {
    throw error;
  }

  if (optimalTree) {
    const prompt = new Confirm({
      message: 'Apply suggested update to original package.json file?',
      default: false,
    });

    const answer = await prompt.run();

    if (answer) {
      try {
        await fs.accessSync(file, fs.constants.W_OK);
      } catch (error) {
        throw 'no access for write, file: ' + file;
      }

      try {
        fs.writeFileSync(file, JSON.stringify(optimalTree, null, 4));
      } catch (error) {
        throw 'write error' + file + '\n' + error;
      }
      console.log('changed package.json');
    }
  }

  console.log('bye');
};

const printError = message => {
  console.log(chalk.bgRed.black(' ERROR '));
  console.log(message);
};

const cli = cac();

cli
  .command('[...file]', 'Check project dependencies duplicates by package.json')
  .option('-c, --flush-cache', 'Flush cache')
  .option('-d, --duplicates', 'Show duplicates in source and optimal tree')
  .option('-s, --source-tree-duplicates', 'Show duplicates in source tree')
  .option('-o, --optimal-tree-duplicates', 'Show duplicates in optimal tree')
  .example('ostap ./package.json')
  .example('ostap ./package.json --flush-cache')
  .example('ostap /Users/frontend/monkey/package.json -d')
  .action(([filePath], flags) => {
    const file = filePath || './package.json';
    let options = { ...DEFAULT_OPTIONS };

    if (flags['flushCache']) {
      options.useCache = false;
    }

    if (flags['sourceTreeDuplicates'] || flags['duplicates']) {
      options.printSourceTreeDuplicates = true;
    }

    if (flags['optimalTreeDuplicates'] || flags['duplicates']) {
      options.printOptimalTreeDuplicates = true;
    }

    Promise.resolve()
      .then(() => run(file, options))
      .catch(printError);
  });

cli.version(pkg.version);
cli.help();

cli.parse();
