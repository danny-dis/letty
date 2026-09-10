// Zero-trace rebrand guard: fails if any upstream pi branding remains.
// Run: node scripts/check-rebrand.mjs (also wired into .github/workflows/ci.yml)
//
// Deliberate keeps (NOT flagged):
// - @earendil-works/gondolin: real third-party npm package name.
// - cchistory.mariozechner.at + mariozechner.at/posts citations: third-party provenance.
// - highlight.min.js Lua/R builtins + native PI_NAPI_*/PI_CLIPBOARD_* macros: vendored code.
// - {"query":"pi"} style dummy payloads in ai tests: arbitrary test data.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const SELF = "scripts/check-rebrand.mjs";

const failures = [];

function walk(dir, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (
			entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" ||
			entry.name === ".gitnexus" || entry.name === "native" || entry.name === "vendor" ||
			entry.name === "data"
		) continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else out.push(full);
	}
	return out;
}

const WORD_PI = /(?<![A-Za-z0-9_])pi(?![A-Za-z0-9_])/;
const WORD_Pi = /(?<![A-Za-z0-9_])Pi(?![A-Za-z0-9_])/;
const SELF_ALLOW = new RegExp(SELF.replace(/\//g, "[/\\\\]") + "$");

function checkFile(path, rules) {
	let text;
	try {
		text = readFileSync(path, "utf8");
	} catch {
		return;
	}
	if (text.includes("\0")) return;
	for (const { pattern, message, allowPath, allowContent, allowLine } of rules) {
		if (path === SELF || SELF_ALLOW.test(path)) continue;
		if (allowPath?.test(path)) continue;
		pattern.lastIndex = 0;
		const match = pattern.exec(text);
		if (!match) continue;
		if (allowContent && allowContent.test(match[0])) continue;
		const lineStart = text.lastIndexOf("\n", match.index - 1) + 1;
		const lineEnd = text.indexOf("\n", match.index);
		const line = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
		if (allowLine && allowLine.test(line)) continue;
		const lineNo = text.slice(0, match.index).split("\n").length;
		failures.push(`${path}:${lineNo}: ${message} (${JSON.stringify(match[0].slice(0, 60))})`);
	}
}

const LOCK = /package-lock\.json$|npm-shrinkwrap\.json$/;
const HISTORY = /CHANGELOG\.md$/;
const FIXTURE = /\.jsonl$/;
const VENDOR = /highlight\.min\.js$/;
const GONDOLIN = /@earendil-works\/gondolin/;

const allFiles = walk(repoRoot);
const textFiles = allFiles.filter((f) => {
	if (!/\.(ts|tsx|js|mjs|cjs|md|mdx|json|sh|ps1|bat|yml|yaml|toml)$/.test(f)) return false;
	if (LOCK.test(f) || HISTORY.test(f) || FIXTURE.test(f) || VENDOR.test(f)) return false;
	return true;
});

// 1. No whole-word pi/Pi tokens in source, scripts, docs, manifests.
// Allows: third-party sbx-kits docs URL (external repo path, not our branding).
// CamelCase rule allows Api-family words (ApiKey, apiVersion, ...).
const SBX_KITS_URL = /sbx-kits-contrib\/tree\/main\/pi/;
const API_WORD = /api/i;
for (const file of textFiles) {
	checkFile(file, [
		{ pattern: new RegExp(WORD_PI.source, "g"), message: "whole-word pi", allowLine: SBX_KITS_URL },
		{ pattern: new RegExp(WORD_Pi.source, "g"), message: "whole-word Pi" },
		{ pattern: /\b\w*(?:Pi[A-Z]|pi[A-Z])\w*/g, message: "camelCase Pi token", allowContent: API_WORD },
	]);
}

// 2. No upstream identity or legacy branding compounds anywhere.
// Allows: packages/evals runtime check that REJECTS legacy scopes in
// generated extensions (it enforces the rebrand, not violates it).
const EVALS_GUARD = /packages[/\\]evals[/\\]src[/\\]extensions\.eval\.ts$/;
for (const file of textFiles) {
	checkFile(file, [
		{ pattern: /@earendil-works\/pi-/g, message: "upstream letty package scope" },
		{ pattern: /@mariozechner\//g, message: "legacy npm scope", allowPath: EVALS_GUARD },
		{ pattern: /pi-mono/g, message: "upstream repo name" },
		{ pattern: /pi\.dev/g, message: "upstream site link" },
		{ pattern: /Earendil/g, message: "upstream org name" },
		{ pattern: /["']@pi\//g, message: "legacy service id" },
		{ pattern: /pi-session-relay/g, message: "legacy relay protocol" },
		{ pattern: /pi-managed-install/g, message: "legacy install marker" },
		{ pattern: /pi-example-plugin|pi-user-agent|pi-manifest|pi-extension-/g, message: "legacy letty- name" },
		{ pattern: /piConfig/g, message: "legacy config key" },
		{ pattern: /getPiUserAgent|readPiManifest|PiManifest|createExtensionAPI|clankolas|dementedelves/g, message: "legacy symbol" },
		{ pattern: /\.pi\//g, message: "legacy config path" },
		{ pattern: /(?<![A-Za-z0-9_])PI_[A-Z]/g, message: "legacy PI_ env prefix" },
		{ pattern: /__PI_/g, message: "legacy __PI_ env name" },
	]);
}

// 3. External gondolin dep must still resolve to the real registry name.
{
	const pkg = JSON.parse(readFileSync(join(repoRoot, "packages/coding-agent/examples/extensions/gondolin/package.json"), "utf8"));
	if (pkg.dependencies?.["@earendil-works/gondolin"] !== "0.12.0") {
		failures.push("gondolin example must depend on @earendil-works/gondolin@0.12.0");
	}
	if (!GONDOLIN.test("ok")) void 0;
}

if (failures.length > 0) {
	console.error(`Rebrand guard failed (${failures.length}):`);
	for (const failure of failures.slice(0, 40)) console.error(`  ${failure}`);
	process.exit(1);
}
console.log("Rebrand guard passed.");
