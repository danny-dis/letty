# Letty coding-agent documentation

> Maintained derivative: [danny-dis/letty](https://github.com/danny-dis/letty) is based on Mario Zechner's [Pi agent](https://github.com/badlogic/pi-mono), with the original MIT notice retained. Copyright (c) 2025 Mario Zechner — see [LICENSE](../../../LICENSE).

Commands here describe this source checkout. External links in historical reference pages do not establish who operates those services.

## Start from the repository

1. Read the [repository README](../../../README.md) for requirements, package layout, and security boundaries.
2. Follow the [quickstart](quickstart.md) to build this checkout and run its CLI.
3. Read the [coding-agent reference](../README.md) for detailed modes, tools, sessions, and flags.

The CLI runs with your user's permissions. Project trust does not sandbox tools or extensions. The source can contact `letty.dev` at startup for update/telemetry operations; see [security](security.md) and [environment variables](environment-variables.md) before running an unfamiliar build.

## Use Letty

- [Usage](usage.md) — interactive and non-interactive workflows.
- [Providers](providers.md) and [llama.cpp](llama-cpp.md) — authentication and model setup.
- [Settings](settings.md), [keybindings](keybindings.md), and [environment variables](environment-variables.md) — configuration.
- [Sessions](sessions.md), [session format](session-format.md), and [compaction](compaction.md) — persistence and context.
- [Security](security.md) and [containerization](containerization.md) — trust decisions and isolation options.

## Extend and integrate

- [Extensions](extensions.md), [skills](skills.md), [prompt templates](prompt-templates.md), [themes](themes.md), and [packages](packages.md) — customization.
- [Models](models.md) and [custom providers](custom-provider.md) — provider customization.
- [SDK](sdk.md), [RPC](rpc.md), [JSON events](json.md), and [TUI](tui.md) — application integrations.

## Platforms and development

- [Windows](windows.md), [Termux](termux.md), [tmux](tmux.md), [terminal setup](terminal-setup.md), and [shell aliases](shell-aliases.md).
- [Development](development.md) and the repository's [contribution guide](../../../CONTRIBUTING.md).
