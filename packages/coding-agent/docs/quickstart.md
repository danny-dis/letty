# Quickstart from danny-dis/letty

> Maintained derivative: [danny-dis/letty](https://github.com/danny-dis/letty) is based on Mario Zechner's [Pi agent](https://github.com/badlogic/pi-mono), with the original MIT notice retained. Copyright (c) 2025 Mario Zechner — see [LICENSE](../../../LICENSE).

This guide runs the source checkout; it does not rely on an external installer or assume that an npm namespace belongs to this maintainer.

## Install and build

Use Node.js 22.19.0 or newer, npm, Git, and a Bash-capable shell (Git Bash on Windows):

```bash
git clone https://github.com/danny-dis/letty.git
cd letty
npm install --ignore-scripts
npm run build
node packages/coding-agent/dist/bundle/cli.js --help
```

The build fetches current model catalogs and requires network access. If you have already generated the catalog, `npm run build:offline` builds against the local copy. `npm install --ignore-scripts` prevents dependency lifecycle scripts during installation; it does not prevent scripts you explicitly run later.

The built CLI uses the code in this checkout; it is not an installed global command. On Windows, run the Bash commands in Git Bash, but use the `node` invocation above for the CLI. To start an interactive session in another project, invoke the built CLI by its absolute path from that project's directory. From the repository root:

```bash
node packages/coding-agent/dist/bundle/cli.js
```

## Authenticate and choose a model

In an interactive session, run `/login` and select a provider, or supply a supported provider API key in your environment. See [Providers](providers.md) for provider-specific setup. Do not paste credentials into prompts or commit auth files. Use `/model` to select from models available to your configured provider.

The default tools include `read`, `write`, `edit`, and `bash`; supported terminals/platforms may offer other tools. Try:

```text
Summarize this repository and tell me how to run its checks.
```

The agent can read and modify files with your account's permissions. Use a disposable checkout or [container](containerization.md) for untrusted work. Project trust prompts control loading of local settings and extensions, not a sandbox.

## Resume or run without an interactive UI

```bash
node packages/coding-agent/dist/bundle/cli.js -c                            # Continue latest session
node packages/coding-agent/dist/bundle/cli.js -p "Summarize this repository" # Print and exit
```

Interactive commands include `/resume`, `/new`, `/tree`, `/fork`, and `/clone`. For process integration, see [JSON events](json.md), [RPC](rpc.md), and the [SDK](sdk.md). Read the [coding-agent reference](../README.md) for all flags and tools.

## Startup network behavior

In addition to the model requests you initiate, the source currently checks `letty.dev` for updates and may send install/update telemetry there. This fork does not claim ownership of that service. Pass `--offline` to the built CLI or set `LETTY_OFFLINE=1` to disable those startup operations. `LETTY_SKIP_VERSION_CHECK=1` and `LETTY_TELEMETRY=0` control them separately. See [Security](../../../SECURITY.md) and [environment variables](environment-variables.md).

## Next steps

- [Docs index](index.md): usage, providers, customization, and integration guides.
- [Contributing](../../../CONTRIBUTING.md): repository workflow and checks.
- [Repository README](../../../README.md): package map and project identity.
