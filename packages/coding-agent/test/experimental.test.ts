import { afterEach, describe, expect, it } from "vitest";
import { areExperimentalFeaturesEnabled } from "../src/core/experimental.ts";

describe("areExperimentalFeaturesEnabled", () => {
	const originalLettyExperimental = process.env.LETTY_EXPERIMENTAL;

	afterEach(() => {
		if (originalLettyExperimental === undefined) {
			delete process.env.LETTY_EXPERIMENTAL;
		} else {
			process.env.LETTY_EXPERIMENTAL = originalLettyExperimental;
		}
	});

	it("returns false when LETTY_EXPERIMENTAL is unset", () => {
		delete process.env.LETTY_EXPERIMENTAL;

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});

	it("returns false when LETTY_EXPERIMENTAL is empty", () => {
		process.env.LETTY_EXPERIMENTAL = "";

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});

	it("returns true when LETTY_EXPERIMENTAL is set to 1", () => {
		process.env.LETTY_EXPERIMENTAL = "1";

		expect(areExperimentalFeaturesEnabled()).toBe(true);
	});

	it("returns false when LETTY_EXPERIMENTAL is set to 0", () => {
		process.env.LETTY_EXPERIMENTAL = "0";

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});

	it("returns false when LETTY_EXPERIMENTAL is set to a non-1 value", () => {
		process.env.LETTY_EXPERIMENTAL = "true";

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});
});
