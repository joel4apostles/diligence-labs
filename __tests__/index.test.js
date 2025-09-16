const { generateResponse } = require('../index');

describe('Claude Integration Tests', () => {
  test('generateResponse function exists', () => {
    expect(generateResponse).toBeDefined();
  });

  test('generateResponse returns a promise', () => {
    const result = generateResponse('test prompt');
    expect(result).toBeInstanceOf(Promise);
  });
});