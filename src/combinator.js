const { byEntropyAndChangesAsc } = require('./utils/sorters');

class Combinator {
  constructor(logger) {
    this._logger = logger;
  }

  getSimpleVariant(suspects) {
    return suspects.map(dependency => {
      const dependenciesChanges = { [dependency.name]: dependency.version };

      return {
        dependenciesChanges,
      };
    });
  }

  getComplexVariant(simpleVariantsResults) {
    let dependenciesChangesCollector = {};

    const sortedSimpleVariantsResults = [...simpleVariantsResults].sort(
      byEntropyAndChangesAsc
    );

    const complexVariants = sortedSimpleVariantsResults.map(data => {
      const { dependenciesChanges } = data;

      dependenciesChangesCollector = {
        ...dependenciesChanges,
        ...dependenciesChangesCollector,
      };

      return {
        dependenciesChanges: dependenciesChangesCollector,
      };
    });

    return complexVariants;
  }
}

module.exports = Combinator;
