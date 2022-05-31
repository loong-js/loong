/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleDirectories: ['node_modules', './packages/**/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  verbose: true,
  moduleNameMapper: {
    '@loong-js/core': '<rootDir>/packages/core/src/index.ts',
    '@loong-js/observer': '<rootDir>/packages/observer/src/index.ts',
    '@loong-js/react-pure': '<rootDir>/packages/react-pure/src/index.ts',
    '@loong-js/react-mobx': '<rootDir>/packages/react-mobx/src/index.ts',
    '@loong-js/react': '<rootDir>/packages/react/src/index.ts',
  },
};
