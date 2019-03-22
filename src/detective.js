const _ = require('lodash');

const removeVersion = fullName =>
  fullName
    .split('@')
    .slice(0, -1)
    .join('@');

const semver = require('semver');

const byVersionDesc = (a, b) => {
  if (semver.lt(a, b)) {
    return 1;
  }

  if (semver.gt(a, b)) {
    return -1;
  }

  return 0;
};

const byVersionAsc = (a, b) => {
  if (semver.lt(a, b)) {
    return -1;
  }

  if (semver.gt(a, b)) {
    return 1;
  }

  return 0;
};

const byMarkAndVersionDesc = (a, b) => {
  const markDiff = b.mark - a.mark;

  if (markDiff) {
    return markDiff;
  }

  return byVersionDesc(a.version, b.version);
};

const byMarkDesc = (a, b) => b.mark - a.mark;

const byCountInstancesAndVersionDesc = (a, b) => {
  const countInstancesDiff = b.countInstances - a.countInstances;

  if (countInstancesDiff) {
    return countInstancesDiff;
  }

  return byVersionDesc(a.version, b.version);
};

const markDependency = (versionsPriority, dependencyVersion) => {
  if (!versionsPriority) {
    return 0;
  }

  const position = versionsPriority.indexOf(dependencyVersion);
  if (position === -1) {
    return 0;
  }

  return versionsPriority.length - position;
};

class Detective {
  constructor(packageCollector, logger) {
    this._packageCollector = packageCollector;
    this._logger = logger;
  }

  async _findOptimalVersions(name, effects) {
    this._logger.log('start find', name, effects);

    const allVersions = await this._packageCollector.getAllVersions(name);

    const analizedVersion = allVersions.map(version => {
      const dependencies = version.dependencies || [];

      return {
        ...version,
        mark: Object.entries(dependencies).reduce((summ, [name, version]) => {
          return summ + markDependency(effects[name], version);
        }, 0),
      };
    });

    const bestMatchVersions = analizedVersion
      .filter(version => version.mark)
      .sort(byMarkAndVersionDesc);

    const bestMatchVersion = bestMatchVersions[0];

    this._logger.log('end find', name, bestMatchVersion);

    return bestMatchVersion;
  }

  async getSuspects(root, scoupe) {
    const rootPackageName = root.name;
    const versions = {};

    Object.entries(scoupe).forEach(([name, data]) => {
      // strategy последняя
      // const usedVersions = Object.keys(data).sort(byVersionDesc);
      // versions[name] = usedVersions;

      // strategy main
      const allVersions = Object.values(data);
      const popularVersion = _.find(allVersions, ['popular', true]);
      versions[name] = [popularVersion.version];
    });

    const effects = {};

    Object.values(scoupe).forEach(dependency => {
      const allVersions = Object.values(dependency);

      const hasOnlyOneVersion = allVersions.length === 1;
      if (hasOnlyOneVersion) {
        return; // it is good!
      }

      const extraDependencies = allVersions.filter(
        dependency => !dependency.popular
      );

      extraDependencies.forEach(dependency => {
        // TODO usages ???
        dependency.usages.forEach(path => {
          const carrier = removeVersion(path[1] || path[0]);
          const effect = (path[2] && removeVersion(path[2])) || dependency.name;

          if (!effects[carrier]) {
            effects[carrier] = [];
          }
          effects[carrier].push(effect);
        });
      });
    });

    // bad mutation
    Object.keys(effects).forEach(carrier => {
      effects[carrier] = _.uniq(effects[carrier]);
    });

    const suspects = [];

    await Promise.all(
      Object.entries(effects).map(async ([name, effects]) => {
        if (name === rootPackageName) {
          effects.forEach(effect => {
            suspects.push({
              name: effect,
              version: versions[effect][0],
            });
          });
        } else {
          const allVersions = await this._packageCollector.getAllVersions(name);
          this._logger.log('find all', name, effects);

          effects.forEach(effect => {
            this._logger.log(effect, versions[effect]);
          });

          const markedVersions = allVersions.map(version => {
            if (!version.dependencies) {
              return {
                mark: 0,
              };
            }
            const reason = [];
            const summary = Object.keys(version.dependencies).length;
            const matches = Object.entries(version.dependencies).reduce(
              (summ, [name, value]) => {
                if (
                  versions[name] &&
                  semver.satisfies(versions[name][0], value)
                ) {
                  return summ + 1;
                } else {
                  reason.push(name + '@' + value);
                }

                return summ;
              },
              0
            );

            const mark = matches / summary;

            return {
              mark,
              reason,
              data: version,
            };
          });

          const topMark = markedVersions.reduce(
            (max, item) => Math.max(max, item.mark),
            -Infinity
          );
          const topMarked = markedVersions.filter(
            version => version.mark === topMark
          );

          const bestEverVersion = _.find(topMarked, [
            'data.version',
            versions[name][0],
          ]);

          const rootVersion = root.dependencies[name];
          const sourceVersion = _.find(topMarked, [
            'data.version',
            rootVersion,
          ]);

          const minorChangedVersions = topMarked.filter(data => {
            const diff = semver.diff(data.data.version, rootVersion);

            return diff === 'minor' || diff === 'preminor';
          });

          const patchChangedVersions = topMarked.filter(data => {
            const diff = semver.diff(data.data.version, rootVersion);

            return diff === 'patch' || diff === 'prepatch';
          });

          const majorChangedVersions = topMarked.filter(data => {
            const diff = semver.diff(data.data.version, rootVersion);

            return diff === 'major' || diff === 'premajor';
          });

          const selected =
            bestEverVersion ||
            sourceVersion ||
            minorChangedVersions[0] ||
            patchChangedVersions[0] ||
            majorChangedVersions[0] ||
            topMarked[0];
          this._logger.log('selected', selected);

          suspects.push({
            name: selected.data.name,
            version: selected.data.version,
          });
        }
      })
    );

    return suspects;
  }
}

module.exports = Detective;
