import { describe, expect, it } from "vitest";
import { getLettyUserAgent } from "../src/utils/letty-user-agent.ts";

describe("getLettyUserAgent", () => {
	it("formats the user agent expected by letty.dev", () => {
		const runtime = process.versions.bun ? `bun/${process.versions.bun}` : `node/${process.version}`;
		const userAgent = getLettyUserAgent("1.2.3");

		expect(userAgent).toBe(`letty/1.2.3 (${process.platform}; ${runtime}; ${process.arch})`);
		expect(userAgent).toMatch(/^letty\/[^\s()]+ \([^;()]+;\s*[^;()]+;\s*[^()]+\)$/);
	});
});
