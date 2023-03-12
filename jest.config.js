module.exports = {
   preset: 'ts-jest',
   testEnvironment: 'node',
   testRegex: './test/.*\\.(test|spec)?\\.(ts|tsx)$',
   moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
   coverageDirectory: './coverage',
   collectCoverageFrom : [
     "**/*.ts",
     "!**/node_modules/**"
   ]
};
