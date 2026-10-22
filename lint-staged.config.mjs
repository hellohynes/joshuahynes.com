// Runs on staged files at commit. Oxlint gets the staged source files; the agent tooling check ignores file
// arguments, so it is a function and runs once whenever any tooling file is staged.
export default {
  '*.{ts,tsx,js,mjs}': 'oxlint',
  '{.agents/**,.claude/**,.codex/**,AGENTS.md,scripts/check-agent-tooling*}': () => 'pnpm check:agents',
}
