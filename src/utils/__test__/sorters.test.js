const Sorters = require('../sorters');

test('byEntropyAndChangesAsc', async () => {
  // Arrange
  const fakeVariants = [
    {
      entropy: 3,
      dependenciesChanges: {
        a: 1,
        b: 2,
      },
    },
    {
      entropy: 1,
      dependenciesChanges: {
        a: 1,
        b: 2,
      },
    },
    {
      entropy: 1,
      dependenciesChanges: {
        a: 1,
      },
    },
  ];

  // Act
  const result = fakeVariants.sort(Sorters.byEntropyAndChangesAsc);

  // Assert
  expect(result).toEqual([
    {
      entropy: 1,
      dependenciesChanges: {
        a: 1,
      },
    },
    {
      entropy: 1,
      dependenciesChanges: {
        a: 1,
        b: 2,
      },
    },
    {
      entropy: 3,
      dependenciesChanges: {
        a: 1,
        b: 2,
      },
    },
  ]);
});
