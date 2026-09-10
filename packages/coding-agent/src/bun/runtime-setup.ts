import { bedrockProviderModule } from "@letty/letty-ai/bedrock-provider";
import { registerBunOAuthFlows } from "@letty/letty-ai/bun-oauth";
import { setBedrockProviderModule } from "@letty/letty-ai/compat";
import { APP_NAME } from "../config.ts";

process.title = APP_NAME;
process.emitWarning = (() => {}) as typeof process.emitWarning;
registerBunOAuthFlows();
setBedrockProviderModule(bedrockProviderModule);
