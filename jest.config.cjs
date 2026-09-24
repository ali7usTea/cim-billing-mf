/** @type {import('jest').Config} */
module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "@happy-dom/jest-environment",
  // setupFilesAfterEnv: ["@testing-library/jest-dom"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Optional: Adjust testMatch or testRegex as needed
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  moduleNameMapper: {
    "^cim-ui-components$": "<rootDir>/node_modules/cim-ui-components",  // adjust path as needed
    // Example: Map CSS imports to identity-obj-proxy for Jest
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    // Add other mappings as needed
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json"
      }
    ]
  },
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 75
    }
  }
};