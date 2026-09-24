import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const checker = join(dirname(fileURLToPath(import.meta.url)), "check-rebrand.mjs");
const oldName = ["p", "i"].join("");
const oldDisplayName = oldName[0].toUpperCase() + oldName.slice(1);
const credit = `> **Maintained derivative:** Letty derives from Mario Zechner's ${oldDisplayName} agent (https://github.com/badlogic/${oldName}-mono) under its MIT license (Copyright (c) 2025 Mario Zechner).\n`;

test("accepts a narrow source credit but rejects unrelated old branding", () => {
	const root = mkdtempSync(join(tmpdir(), "letty-rebrand-"));
	try {
		const scriptPath = join(root, "scripts", "check-rebrand.mjs");
		const packagePath = join(root, "packages", "coding-agent", "examples", "extensions", "gondolin", "package.json");
		mkdirSync(dirname(scriptPath), { recursive: true });
		mkdirSync(dirname(packagePath), { recursive: true });
		copyFileSync(checker, scriptPath);
		writeFileSync(packagePath, JSON.stringify({ dependencies: { "@earendil-works/gondolin": "0.12.0" } }));
		const readme = join(root, "README.md");
		const run = () => spawnSync(process.execPath, [scriptPath], { cwd: root, encoding: "utf8" });

		writeFileSync(readme, credit);
		let result = run();
		assert.equal(result.status, 0, result.stderr);

		writeFileSync(readme, `${credit}\nThe product is still named ${oldDisplayName}.\n`);
		result = run();
		assert.notEqual(result.status, 0, "unrelated old branding must fail");
		assert.match(result.stderr, /whole-word/);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
