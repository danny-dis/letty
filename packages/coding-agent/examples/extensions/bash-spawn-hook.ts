/**
 * Bash Spawn Hook Example
 *
 * Adjusts command, cwd, and env before execution.
 *
 * Usage:
 *   letty -e ./bash-spawn-hook.ts
 */

import type { ExtensionAPI } from "@letty/letty-coding-agent";
import { createBashTool } from "@letty/letty-coding-agent";

export default function (letty: ExtensionAPI) {
	const cwd = process.cwd();

	const bashTool = createBashTool(cwd, {
		spawnHook: ({ command, cwd, env }) => ({
			command: `source ~/.profile\n${command}`,
			cwd,
			env: { ...env, LETTY_SPAWN_HOOK: "1" },
		}),
	});

	letty.registerTool({
		...bashTool,
		execute: async (id, params, signal, onUpdate, _ctx) => {
			return bashTool.execute(id, params, signal, onUpdate);
		},
	});
}
