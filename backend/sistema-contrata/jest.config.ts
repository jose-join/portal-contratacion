export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/unit/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^firebase/(.*)': '<rootDir>/node_modules/firebase/$1',
  },
  setupFilesAfterEnv: ['./test/setup/setup.ts'],
  
};