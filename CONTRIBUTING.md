# Contributing to Letty

This guide applies to [danny-dis/letty](https://github.com/danny-dis/letty), a maintained derivative described in the [repository README](README.md) under the [MIT license](LICENSE). Changes should be understandable, narrowly scoped, and backed by evidence from this repository.

## Before you contribute

- Read [AGENTS.md](AGENTS.md) for the repository's code, testing, and Git rules. Review agent-generated changes yourself; you are responsible for what you submit.
- Prefer an extension when a feature does not need to be built into the core coding agent. See the [extension guide](packages/coding-agent/docs/extensions.md).
- Check existing issues before opening a new one. Use the repository's issue templates and include a minimal reproduction, expected and actual behavior, affected package, and version or commit.
- For a security-sensitive issue, use [SECURITY.md](SECURITY.md). Do not post exploit details publicly.

## Contributor approval gate

The [issue gate](.github/workflows/issue-gate.yml) auto-closes new contributors' issues; the [PR gate](.github/workflows/pr-gate.yml) auto-closes unapproved PRs. Approval is conveyed by a maintainer reply on an issue:

- `lgtmi` approves future issues, not PRs.
- `lgtm` approves future issues and PRs.

The command must be at the start of the reply (optionally after `@username` mentions) or at the end. Open an issue and seek `lgtm` approval before submitting a PR. An auto-closed issue may be reviewed, but no response time is guaranteed. Collaborators with write-level access follow the workflow's exemptions.

## Work from source

Use Node.js 22.19.0 or newer and a shell with Bash (Git Bash on Windows). From the repository root:

```bash
npm install --ignore-scripts
npm run build
npm run check
./test.sh
```

`npm run build` fetches live model catalogs; `npm run build:offline` uses existing generated catalog data. `./test.sh` runs tests with credentials removed and an isolated home. If a test fails for environmental or platform reasons, report the exact command, error, platform, and whether a focused test passes; do not silently skip a failing check.

For a focused Vitest test, use the package root and the repository's pinned binary:

```bash
cd packages/ai
node "$(git rev-parse --show-toplevel)/node_modules/vitest/dist/cli.js" --run test/kimi-catalog-source.test.ts
```

Do not edit generated `packages/ai/src/models.generated.ts` by hand. Change its generator, regenerate, and review the output. Follow [AGENTS.md](AGENTS.md) for lockfiles, changelogs, and commits. Changelog entries are added by maintainers.

## Submit the change

Explain the problem, the behavior changed, and the verification you ran. Keep changes limited to the affected area; include a regression test for code fixes when feasible. Do not use the PR description to claim that the upstream project, external npm packages, `letty.dev`, or a Discord server are operated by this fork unless independently verified.
