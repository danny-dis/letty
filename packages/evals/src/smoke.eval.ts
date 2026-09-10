import { expect } from "vitest";
import { describeEval } from "vitest-evals";
import { createLettyCodingAgentHarness } from "./letty-harness.ts";

const lettyCodingAgentHarness = createLettyCodingAgentHarness({ noTools: "all" });

describeEval("Letty Coding Agent smoke", { harness: lettyCodingAgentHarness }, (it) => {
	it("runs a basic prompt end to end", async ({ run }) => {
		const result = await run("What's the capital of France? Respond with only the city name.");

		expect(result.output.trim()).toBe("Paris");
		expect(result.errors).toEqual([]);
		expect(result.usage.provider).toBe(process.env.LETTY_PROVIDER);
		expect(result.usage.model).toBe(process.env.LETTY_MODEL);
		expect(result.usage.totalTokens).toBeGreaterThan(0);
	});
});
