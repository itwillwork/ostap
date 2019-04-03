const _ = require('lodash');

const chalk = require('chalk');

const WEIGHTS = {
  major: 1,
  premajor: 1,
  minor: 1,
  preminor: 1,
  patch: 1,
  prepatch: 1,
  prerelease: 1,
  null: 0,
};

const semver = require('semver');

class EntropyService {
  constructor(logger) {
    this._logger = logger;
  }

  scoreEntropy(scoupe) {
    let entropy = 0;

    Object.values(scoupe).forEach(dependency => {
      const allVersions = Object.values(dependency);

      const mainVersion = _.find(allVersions, ['main', true]);

      allVersions.forEach(data => {
        const { countInstances, version } = data;
        const cost =
          countInstances * WEIGHTS[semver.diff(mainVersion.version, version)];
        entropy += cost;
      });
    });

    return entropy;
  }

  getDuplicatesCount(scoupe) {
    let duplicatesCount = 0;

    Object.values(scoupe).forEach(dependency => {
      const allVersions = Object.values(dependency);

      const duplicatesVersions = allVersions.filter(data => !data.main);

      duplicatesCount += duplicatesVersions.length;
    });

    return duplicatesCount;
  }

  getInfo(scoupe) {
    const entropy = this.scoreEntropy(scoupe);
    const duplicatesCount = this.getDuplicatesCount(scoupe);

    if (!duplicatesCount) {
      return `not found packages with multiple versions 🎉`;
    }

    return `${duplicatesCount} packages with multiple versions, and they spawned ${entropy} duplicates`;
  }

  printDuplicates(scoupe) {
    const entropy = this.scoreEntropy(scoupe);
    const duplicatesCount = this.getDuplicatesCount(scoupe);

    if (duplicatesCount) {
      console.log(
        ` 🔎 ${duplicatesCount} packages with multiple versions, and they spawned ${entropy} duplicates`
      );
    } else {
      console.log(' 🔎 not found packages with multiple versions 👌');
    }

    Object.values(scoupe).forEach(dependency => {
      const allVersions = Object.values(dependency);
      const hasOneVersion = allVersions.length === 1;

      if (hasOneVersion) {
        return;
      }

      const mainVersion = _.find(allVersions, ['main', true]);
      console.log('\n');
      console.log(chalk.bold.yellow(`\ WARNING in ${mainVersion.name}`));
      console.log(
        '   Multiple version of versions ' +
          chalk.bold.green(mainVersion.name) +
          '  found:'
      );

      allVersions.forEach(data => {
        console.log(
          '   ' +
            chalk.bold.green(data.version + ' ' + (data.main ? '[main]' : ''))
        );

        const usages = data.usages.map(path => {
          return path.join('/');
        });

        const dedupedUsages = data.dedupedUsages.map(path => {
          return path.join('/');
        });

        usages.forEach(path => {
          const isDeduped = !dedupedUsages.includes(path);
          let view = '    ';
          if (isDeduped) {
            view += chalk.grey(path + ' (deduped)');
          } else {
            view += chalk.bold(path);
          }
          console.log(view);
        });
      });
    });
  }
}

module.exports = EntropyService;
