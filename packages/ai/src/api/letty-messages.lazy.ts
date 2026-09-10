import type { ProviderStreams } from "../types.ts";
import { lazyApi } from "./lazy.ts";

export const lettyMessagesApi = (): ProviderStreams => lazyApi(() => import("./letty-messages.ts"));
