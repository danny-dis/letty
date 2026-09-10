import { homedir } from "node:os";
import { resolve } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import { resolveSessionDirectory } from "../src/experimental/server.ts";

afterEach(() => vi.unstubAllEnvs());

describe("experimental server session directory", () => {
	test("uses the experimental directory under the configured agent directory by default", () => {
		vi.stubEnv("LETTY_CODING_AGENT_DIR", "/tmp/letty-agent-config");

		expect(resolveSessionDirectory()).toBe("/tmp/letty-agent-config/experimental/sessions");
	});

	test("resolves an explicit relative directory from the current working directory", () => {
		vi.stubEnv("LETTY_CODING_AGENT_DIR", "/tmp/letty-agent-config");

		expect(resolveSessionDirectory("relative/sessions")).toBe(resolve("relative/sessions"));
	});

	test("expands a tilde in an explicit directory", () => {
		expect(resolveSessionDirectory("~/custom-sessions")).toBe(resolve(homedir(), "custom-sessions"));
	});
});
