const byEntropyAndChanges = order => (fault = 0) => (a, b) => {
  const getEntropy = variant => variant.entropy;
  const countChanges = variant =>
    Object.keys(variant.dependenciesChanges).length;

  const entropyDiff = order(getEntropy(a), getEntropy(b));
  const averageEntropy = (getEntropy(a) + getEntropy(b)) / 2;

  if (entropyDiff && Math.abs(entropyDiff / averageEntropy) > fault) {
    return entropyDiff;
  }

  const changesDiff = order(countChanges(a), countChanges(b));
  return changesDiff;
};

const asc = (a, b) => a - b;
const desc = (a, b) => b - a;

module.exports = {
  byEntropyAndChangesAsc: byEntropyAndChanges(asc)(0),
  byEntropyAndChangesAscWithFault: byEntropyAndChanges(asc),
};
