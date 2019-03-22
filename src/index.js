const _ = require('lodash');
const buildTreeAsync = require('dependencies-tree-builder');
const EntropyService = require('./entropy_service');
const Combinator = require('./combinator');
const Logger = require('./logger');
const Detective = require('./detective');
const chalk = require('chalk');
const ora = require('ora');
const { byEntropyAndChangesAscWithFault } = require('./utils/sorters');

const DEFAULT_OPTIONS = {
  useCache: true,
  viewFullLogs: false,
  printSourceTreeDuplicates: false,
  printOptimalTreeDuplicates: false,
};

const defaultLogger = new Logger();

const spinner = ora({
  color: 'yellow',
});

module.exports = async (
  treeRoot,
  options = DEFAULT_OPTIONS,
  logger = defaultLogger
) => {
  const start = Date.now();

  logger.setStrategy(options);

  spinner.start('analyzing source dependencies tree');

  const { scoupe, packageCollector } = await buildTreeAsync(
    treeRoot,
    options,
    logger
  );

  const entropyService = new EntropyService(logger);

  const sourceEntropy = entropyService.scoreEntropy(scoupe);

  spinner.succeed('source tree: ' + entropyService.getInfo(scoupe));

  if (options.printSourceTreeDuplicates) {
    entropyService.printDuplicates(scoupe);
    console.log('\n');
  }

  spinner.start('optimizing...');

  const detective = new Detective(packageCollector, logger);
  const suspects = await detective.getSuspects(treeRoot, scoupe);

  const applyDependencyChanges = dependenciesChanges => {
    const newTreeRoot = _.cloneDeep(treeRoot);

    newTreeRoot.dependencies = {
      ...newTreeRoot.dependencies,
      ...dependenciesChanges,
    };

    return newTreeRoot;
  };

  const analizeVariantsAsync = async variants => {
    return await Promise.all(
      variants.map(async ({ dependenciesChanges }) => {
        logger.log(
          'try change root dependency\n' +
            JSON.stringify(dependenciesChanges, null, 4)
        );

        const variantTreeRoot = applyDependencyChanges(dependenciesChanges);

        const { scoupe } = await buildTreeAsync(
          variantTreeRoot,
          { ...options, useCache: true },
          logger
        );

        const entropy = entropyService.scoreEntropy(scoupe);

        logger.log(
          'done analyze change root dependency, entropy: ' +
            entropy +
            '\n' +
            JSON.stringify(dependenciesChanges, null, 4)
        );

        return {
          dependenciesChanges,
          entropy,
        };
      })
    );
  };

  const combinator = new Combinator(logger);

  const simpleVariants = combinator.getSimpleVariant(suspects);
  const simpleVariantsResults = await analizeVariantsAsync(simpleVariants);

  const complexVariants = combinator.getComplexVariant(simpleVariantsResults);
  const complexVariantsResults = await analizeVariantsAsync(complexVariants);

  const allResults = [...simpleVariantsResults, ...complexVariantsResults];

  const optimalVariant = allResults.sort(
    byEntropyAndChangesAscWithFault(0.05)
  )[0];

  spinner.succeed(`done, ${(Date.now() - start) / 1000}s`);
  spinner.start('analyzing optimal dependencies tree');

  const optimalTreeRoot = applyDependencyChanges(
    optimalVariant.dependenciesChanges
  );

  const { scoupe: optimalTreeScoupe } = await buildTreeAsync(
    optimalTreeRoot,
    { ...options, useCache: true },
    logger
  );

  spinner.succeed('optimal tree: ' + entropyService.getInfo(optimalTreeScoupe));

  if (!_.isEmpty(optimalVariant) && optimalVariant.entropy < sourceEntropy) {
    const sourceDependencies = treeRoot.dependencies;
    const optimalDependencies = optimalTreeRoot.dependencies;

    console.log(
      '\n' + chalk.yellow.bold('suggested update:'.toUpperCase()) + '\n'
    );

    let count = 0;
    Object.keys(sourceDependencies).map((name, idx) => {
      if (
        optimalDependencies[name] &&
        optimalDependencies[name] !== sourceDependencies[name]
      ) {
        const view =
          _.padEnd(name, 30) +
          _.padEnd(sourceDependencies[name], 8) +
          '  →  ' +
          _.padEnd(optimalDependencies[name], 8);

        const styler = count++ % 2 ? chalk.bold : chalk;

        console.log(styler(view));
      }
    });
    console.log('\n');

    if (options.printOptimalTreeDuplicates) {
      entropyService.printDuplicates(optimalTreeScoupe);
      console.log('\n');
    }

    return optimalTreeRoot;
  } else {
    console.log('well done, not found duplicates');
  }

  return null;
};
