const Combinator = require('../combinator');

test('getSimpleVariant', async () => {
  // Arrange
  const fakeSuspects = [{ name: 'a', version: 1 }, { name: 'b', version: 2 }];

  // Act
  const combinator = new Combinator();
  const result = combinator.getSimpleVariant(fakeSuspects);

  // Assert
  expect(result).toEqual([
    {
      dependenciesChanges: {
        a: 1,
      },
    },
    {
      dependenciesChanges: {
        b: 2,
      },
    },
  ]);
});

test('getComplexVariant', async () => {
  // Arrange
  const suspects = [
    {
      dependenciesChanges: {
        c: 1,
      },
      entropy: 3,
    },
    {
      dependenciesChanges: {
        a: 1,
      },
      entropy: 2,
    },
    {
      dependenciesChanges: {
        b: 2,
      },
      entropy: 2,
    },
  ];

  // Act
  const combinator = new Combinator();
  const result = combinator.getComplexVariant(suspects);

  // Assert
  expect(result).toEqual([
    {
      dependenciesChanges: {
        a: 1,
      },
    },
    {
      dependenciesChanges: {
        a: 1,
        b: 2,
      },
    },
    {
      dependenciesChanges: {
        a: 1,
        b: 2,
        c: 1,
      },
    },
  ]);
});
