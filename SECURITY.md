# Security policy for danny-dis/letty

This policy covers code maintained in [danny-dis/letty](https://github.com/danny-dis/letty). Letty is a local coding agent and a maintained derivative; the [README](README.md) credits the original project. This repository does not claim to operate `letty.dev`, its installer, or any third-party package service; findings in those systems should go to their operators, not be attributed to this fork.

## Reporting a sensitive finding

Do **not** publish exploit details or credentials in a public issue. GitHub's private vulnerability reporting is not currently enabled for this repository, and `security@letty.dev` is not a verified contact for this maintainer. If you do not have a private channel to `danny-dis`, open a short issue asking for a private contact method **without** sharing sensitive details. Once a private channel is agreed, include a reproduction, impact, affected commit/version, and any mitigation. Issue auto-closure for new contributors does not make a public exploit report safe.

## Security boundary

The coding agent runs with the invoking user's permissions. It can read or modify files and run tools available to that user. A project trust decision controls whether project-local settings and extensions are loaded; it is not an OS sandbox. Use a container or VM if the repository, tools, or model output need stronger isolation; see the [containerization guide](packages/coding-agent/docs/containerization.md).

A person who can already modify your home directory, workspace, shell configuration, environment, `AGENTS.md`, `.letty` configuration, skills, or extensions can influence Letty and other developer tools. Treat these as trusted local inputs. Review third-party packages and extensions before running them.

## What to report

A reproducible bypass of a security boundary introduced by this repository's code is in scope. Include how the boundary is crossed and what an attacker gains **without already having equivalent local write or execution access**. The current behavior of distributed packages, CLI, and APIs is relevant; external services are not covered by this repo's policy.

Expected local-agent behavior is generally out of scope: prompt injection in trusted content, malicious model output, code executed by user-installed extensions, actions the user authorized, and claims that rely only on prior access to user-writable files or configuration. A report that demonstrates Letty itself granting such access or crossing an OS privilege boundary may still be in scope. Give enough evidence to distinguish a real boundary bypass from a trust decision or local setup risk.

## Startup network requests

The source currently makes a version-check request and may send an install/update telemetry ping to `letty.dev`. To disable those startup operations, use `--offline` or set `LETTY_OFFLINE=1`. `LETTY_SKIP_VERSION_CHECK=1` disables only the update check; `LETTY_TELEMETRY=0` disables the telemetry ping. These controls do not prevent an explicit model or tool request from using the network. See the [CLI documentation](packages/coding-agent/README.md#telemetry-and-update-checks) for details.
