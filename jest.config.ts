import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],

  moduleFileExtensions: ["ts", "js"],

  setupFilesAfterEnv: ["<rootDir>/src/config/__test__/setup.ts"],
};

export default config;
