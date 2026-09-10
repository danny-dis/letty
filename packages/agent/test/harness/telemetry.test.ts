import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTypedSpanStarter, NOOP_TELEMETRY_CONTEXT, type TelemetryContext } from "@letty/letty-telemetry";
import { describe, expect, expectTypeOf, it } from "vitest";
import { renderAgentTelemetrySchemaMarkdown } from "../../scripts/generate-telemetry-docs.ts";
import { BACKGROUND_CONTEXT, withTelemetryContext } from "../../src/harness/context.ts";
import {
	AGENT_TELEMETRY_SCHEMAS,
	AI_TELEMETRY_SCHEMA,
	type AiSpanEndAttributes,
	type AiSpanStartAttributes,
	HARNESS_TELEMETRY_SCHEMA,
	type HarnessSpanEndAttributes,
	type HarnessSpanStartAttributes,
	startAiSpan,
	startHarnessSpan,
} from "../../src/harness/telemetry.ts";

describe("agent telemetry schemas", () => {
	it("serializes both schemas and generates the checked-in reference", () => {
		expect(() => JSON.stringify(AI_TELEMETRY_SCHEMA)).not.toThrow();
		expect(() => JSON.stringify(HARNESS_TELEMETRY_SCHEMA)).not.toThrow();
		expect(AGENT_TELEMETRY_SCHEMAS).toEqual([AI_TELEMETRY_SCHEMA, HARNESS_TELEMETRY_SCHEMA]);
		expect(Object.keys(HARNESS_TELEMETRY_SCHEMA.spans)).toEqual([
			"letty.harness.run",
			"letty.harness.compaction",
			"letty.harness.navigation",
			"letty.harness.checkpoint",
			"letty.harness.turn",
			"letty.harness.step",
			"letty.harness.tool",
			"letty.harness.hook",
			"letty.harness.sleep",
			"letty.harness.event_handler",
			"letty.session.write",
		]);
		const actual = readFileSync(resolve(import.meta.dirname, "../../docs/telemetry-schema.md"), "utf8");
		expect(actual).toBe(renderAgentTelemetrySchemaMarkdown());
	});

	it("starts AI-request and harness spans through one composed typed starter", async () => {
		const startSpan = createTypedSpanStarter(NOOP_TELEMETRY_CONTEXT, AGENT_TELEMETRY_SCHEMAS);
		await startSpan(
			"letty.harness.step",
			{
				"letty.lane.name": "main",
				"letty.operation.id": "operation",
				"letty.step.kind": "assistant",
				"letty.step.attempt": 1,
			},
			async (stepSpan, startChildSpan) => {
				stepSpan.setAttributes({ "letty.step.outcome": "succeeded" });
				await startChildSpan(
					"letty.ai.request",
					{
						"letty.ai.operation": "stream",
						"letty.ai.provider": "provider",
						"letty.ai.model": "model",
						"letty.ai.api": "api",
						"letty.ai.streaming": true,
					},
					(requestSpan) => {
						requestSpan.setAttributes({ "letty.ai.response.stop_reason": "stop" });
					},
				);
			},
		);
	});

	it("infers exact AI start and optional end attributes", async () => {
		type Start = AiSpanStartAttributes<"letty.ai.request">;
		type End = AiSpanEndAttributes<"letty.ai.request">;
		expectTypeOf<Start>().toMatchTypeOf<{
			"letty.ai.operation": "stream" | "fetch_deferred" | "cancel_deferred" | "generate_images";
			"letty.ai.provider": string;
			"letty.ai.model": string;
			"letty.ai.api": string;
			"letty.ai.streaming": boolean;
			"letty.ai.deferred"?: boolean;
		}>();
		expectTypeOf<End["letty.ai.response.stop_reason"]>().toEqualTypeOf<
			"stop" | "length" | "tool_use" | "error" | "aborted" | "deferred" | undefined
		>();

		const telemetryContext: TelemetryContext = NOOP_TELEMETRY_CONTEXT;
		const context = withTelemetryContext(telemetryContext, BACKGROUND_CONTEXT);
		await startAiSpan(
			"letty.ai.request",
			{
				"letty.ai.operation": "stream",
				"letty.ai.provider": "provider",
				"letty.ai.model": "model",
				"letty.ai.api": "api",
				"letty.ai.streaming": true,
			},
			(span) => {
				span.setAttributes({ "letty.ai.response.stop_reason": "tool_use" });
				// @ts-expect-error letty.ai.request declares no span events
				span.addEvent("chunk");
			},
			context,
		);

		const compileTimeFailures = () => {
			const extraAttributes = {
				"letty.ai.operation": "stream",
				"letty.ai.provider": "provider",
				"letty.ai.model": "model",
				"letty.ai.api": "api",
				"letty.ai.streaming": true,
				"letty.ai.unknown": true,
			} as const;
			// @ts-expect-error variables with unknown attributes are rejected
			void startAiSpan("letty.ai.request", extraAttributes, () => {}, context);
			// @ts-expect-error missing required start attributes
			void startAiSpan("letty.ai.request", { "letty.ai.operation": "stream" }, () => {}, context);
		};
		expectTypeOf(compileTimeFailures).toBeFunction();
	});

	it("infers per-span harness literals and optional completion enrichment", async () => {
		type RunStart = HarnessSpanStartAttributes<"letty.harness.run">;
		type RunEnd = HarnessSpanEndAttributes<"letty.harness.run">;
		type WriteStart = HarnessSpanStartAttributes<"letty.session.write">;
		type WriteEnd = HarnessSpanEndAttributes<"letty.session.write">;
		expectTypeOf<RunStart["letty.operation.kind"]>().toEqualTypeOf<"run">();
		expectTypeOf<RunEnd["letty.operation.outcome"]>().toEqualTypeOf<
			"completed" | "aborted" | "failed" | "suspended" | undefined
		>();
		const writeStart = {
			"letty.session.id": "session",
			"letty.session.item_count": 2,
			"letty.session.item_kinds": ["entry", "value", "list"],
		} satisfies WriteStart;
		const writeEnd = {
			"letty.session.first_seq": 1,
			"letty.session.last_seq": 2,
		} satisfies WriteEnd;
		expectTypeOf(writeStart["letty.session.item_count"]).toEqualTypeOf<number>();
		expectTypeOf(writeEnd["letty.session.last_seq"]).toEqualTypeOf<number>();

		const telemetryContext: TelemetryContext = NOOP_TELEMETRY_CONTEXT;
		const context = withTelemetryContext(telemetryContext, BACKGROUND_CONTEXT);
		await startHarnessSpan(
			"letty.harness.run",
			{
				"letty.session.id": "session",
				"letty.lane.name": "main",
				"letty.operation.id": "operation",
				"letty.operation.kind": "run",
				"letty.operation.recovery": false,
			},
			(span) => {
				span.setAttributes({ "letty.operation.outcome": "completed" });
				span.setAttributes({});
				// @ts-expect-error the harness schema declares no span events
				span.addEvent("result");
			},
			context,
		);

		const compileTimeFailures = () => {
			const extraRunAttributes = {
				"letty.session.id": "session",
				"letty.lane.name": "main",
				"letty.operation.id": "operation",
				"letty.operation.kind": "run",
				"letty.operation.recovery": false,
				"letty.unknown": true,
			} as const;
			// @ts-expect-error variables with unknown attributes are rejected
			void startHarnessSpan("letty.harness.run", extraRunAttributes, () => {}, context);
			void startHarnessSpan(
				"letty.harness.checkpoint",
				{
					"letty.lane.name": "main",
					"letty.operation.id": "operation",
					"letty.checkpoint.kind": "normal",
				},
				(span) => {
					// @ts-expect-error empty end schemas reject every attribute
					span.setAttributes({ "letty.unknown": true });
				},
				context,
			);
			void startHarnessSpan(
				"letty.harness.run",
				{
					"letty.session.id": "session",
					"letty.lane.name": "main",
					"letty.operation.id": "operation",
					// @ts-expect-error run spans accept only the run operation kind
					"letty.operation.kind": "navigation",
					"letty.operation.recovery": false,
				},
				() => {},
				context,
			);
			// @ts-expect-error missing required run start attributes
			void startHarnessSpan("letty.harness.run", {}, () => {}, context);
		};
		expectTypeOf(compileTimeFailures).toBeFunction();
	});
});
