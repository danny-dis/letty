# Letty

> Maintained derivative: [danny-dis/letty](https://github.com/danny-dis/letty) is based on Mario Zechner's [Pi agent](https://github.com/badlogic/pi-mono), with the original MIT notice retained. Copyright (c) 2025 Mario Zechner — see [LICENSE](LICENSE).

Letty is a terminal coding agent and a set of libraries for building agent-driven applications. `danny-dis` maintains this checkout; it is not the original source repository.

The coding agent can read and edit files, run commands, use multiple model providers, and keep resumable sessions. It supports interactive use, one-shot output, JSON events, RPC, and an embeddable SDK. Extensions, skills, prompt templates, and themes add behavior without making every workflow a core feature.

## Run from this repository

Prerequisites: Node.js **22.19.0 or newer**, npm, and Git. From a shell with Bash available (including Git Bash on Windows):

```bash
git clone https://github.com/danny-dis/letty.git
cd letty
npm install --ignore-scripts
npm run build
node packages/coding-agent/dist/bundle/cli.js --help
node packages/coding-agent/dist/bundle/cli.js
```

`npm run build` downloads current model catalogs before building the workspaces, so it needs network access. After model data has been generated, `npm run build:offline` rebuilds using the local catalog. The `node` command above runs the built CLI from this checkout; `--help` does not require a provider key. To use a model, authenticate through `/login` or configure a provider key as described in the [quickstart](packages/coding-agent/docs/quickstart.md).

**Distribution note:** This checkout contains package names and references to `letty.dev`, npm, and Discord inherited from its lineage. Their presence does not establish that `danny-dis` operates those services or publishes those packages. The commands above use this repository directly; verify the publisher before using an external installer or package.

## What is in the repo?

The root `package.json` builds these 11 primary workspaces. Extension examples under `packages/coding-agent/examples/` are additional workspaces.

| Package | Purpose |
| --- | --- |
| [Coding agent](packages/coding-agent/README.md) | Terminal CLI, tools, sessions, extensions, and SDK |
| [AI](packages/ai/README.md) | Provider adapters, model catalogs, streaming, and auth |
| [Agent core](packages/agent/README.md) | Tool-calling loop, state, and events |
| [TUI](packages/tui/README.md) | Terminal UI components |
| [Telemetry](packages/telemetry/README.md) | Vendor-neutral telemetry contracts |
| [Chord](packages/chord/README.md) | Application composition and service primitives |
| [SQLite session backend](packages/session-backends/sqlite-node/README.md) | Node SQLite persistence for agent sessions |
| [Protocol](packages/protocol/README.md) | Framed CBOR protocol for remote sessions |
| [Client](packages/client/README.md) | Transport-neutral remote-session client |
| [Server](packages/server/README.md) | Experimental remote-session server |
| [Evals](packages/evals/README.md) | Evaluation tooling |

For a guided first session, start with the [quickstart](packages/coding-agent/docs/quickstart.md). The [documentation index](packages/coding-agent/docs/index.md) links usage, providers, extension authoring, SDK, and RPC references. Maintainers can consult the [documentation audit facts](docs/DOC_AUDIT_FACTS.md) for the source paths behind these descriptions.

## Develop and verify

```bash
npm run check          # Formatting, dependency checks, TypeScript, rebrand guard, smoke check
./test.sh              # Tests in an isolated home with API credentials removed
npm run build:offline  # Build against already-generated model data
```

The upstream model catalog changes over time. `npm run build` refreshes it, whereas `build:offline` uses the last generated data. The CI workflow runs build, check, and tests on Ubuntu; a successful local build is not a claim that every test passes on every platform. For focused test commands and contribution rules, see [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).

## Security and network behavior

The CLI normally has the permissions of the user who launched it. Project trust governs loading project-local configuration and extensions; it is **not** a filesystem, process, or network sandbox. Review untrusted repos and extensions, or use a container or VM. See the [security policy](SECURITY.md) and [containerization guide](packages/coding-agent/docs/containerization.md).

Current source code contacts `letty.dev` for startup version checks and optional install/update telemetry. This repository does **not** claim ownership of that domain. Use `--offline` or `LETTY_OFFLINE=1` to disable those startup operations; `LETTY_SKIP_VERSION_CHECK=1` and `LETTY_TELEMETRY=0` control them separately. These flags do not prevent an authenticated model request you explicitly make.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) before filing issues or PRs; this repo has an approval gate for new contributors. Report sensitive findings using [SECURITY.md](SECURITY.md), not a public exploit report.

MIT. Original work copyright © 2025 Mario Zechner; see [LICENSE](LICENSE). This repository is a maintained derivative, not a claim of original authorship.
