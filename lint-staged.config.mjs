// Runs Oxlint on the staged source files at commit. The agent tooling check runs from .husky/pre-commit
// instead: lint-staged skips deleted files, and deleting a skill or its Claude copy breaks their parity.
export default {
  '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}': 'oxlint',
}
