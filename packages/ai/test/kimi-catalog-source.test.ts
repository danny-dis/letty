import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

it("retains the Kimi coding provider when models.dev uses its regional source ID", () => {
	const root = mkdtempSync(join(tmpdir(), "letty-kimi-catalog-"));
	try {
		const preload = join(root, "catalog.mjs");
		const output = join(root, "output");
		const ids = ["kimi-for-coding-highspeed", "kimi-for-coding", "k3-256k", "k3"];
		const models = Object.fromEntries(
			ids.map((id) => [
				id,
				{ id, name: id, tool_call: true, reasoning: true, limit: { context: 262144, output: 32768 } },
			]),
		);
		writeFileSync(
			preload,
			`const catalog = ${JSON.stringify({ "kimi-code-plan-cn": { models } })};\n` +
				`globalThis.fetch = async (input) => new Response(JSON.stringify(String(input) === "https://models.dev/api.json" ? catalog : { data: [] }), { status: 200 });\n`,
		);
		const result = spawnSync(
			process.execPath,
			[
				"--import",
				pathToFileURL(preload).href,
				"scripts/generate-models.ts",
				"--json-only",
				"--json-output",
				output,
			],
			{ cwd: packageRoot, encoding: "utf8", timeout: 30_000 },
		);
		expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
		const catalog = JSON.parse(readFileSync(join(output, "models.json"), "utf8"));
		expect(Object.keys(catalog["kimi-coding"])).toEqual(ids.slice().sort());
		for (const model of Object.values(catalog["kimi-coding"]) as { baseUrl: string; api: string }[]) {
			expect(model.baseUrl).toBe("https://api.kimi.com/coding");
			expect(model.api).toBe("anthropic-messages");
		}
	} finally {
		rmSync(root, { force: true, recursive: true });
	}
});
