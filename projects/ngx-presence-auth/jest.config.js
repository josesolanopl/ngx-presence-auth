const base = require("../../jest.config.js");

module.exports = {
  ...base,

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
};
