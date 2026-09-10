# Development

See [AGENTS.md](https://github.com/letty/letty/blob/main/AGENTS.md) for additional guidelines.

## Setup

```bash
git clone https://github.com/letty/letty
cd letty
npm install
npm run build
```

Run from source:

```bash
/path/to/letty/letty-test.sh
```

The script can be run from any directory. Letty keeps the caller's current working directory.

### Experimental remote harness

The remote harness server/client integration is development-only. Run it from the repository with:

```bash
LETTY_EXPERIMENTAL=1 ./letty-test.sh server
LETTY_EXPERIMENTAL=1 ./letty-test.sh client
```

`LETTY_SERVER_DIR` overrides the server profile and socket directory (default: `~/.letty/server`). `LETTY_SERVER_ID` selects the logical server ID when `--server-id` is omitted.

The `client` and `experimental/plugin` package subpaths resolve only under the `source` condition in a checkout. Their implementations and the server/client commands are excluded from npm packages and standalone binaries. `letty-client`, `letty-protocol`, and `letty-server` are development dependencies of coding-agent, not runtime dependencies. The local SDK and stdio RPC API are unchanged.

## Forking / Rebranding

Configure via `package.json`:

```json
{
  "lettyConfig": {
    "name": "letty",
    "configDir": ".letty"
  }
}
```

Change `name`, `configDir`, and `bin` field for your fork. Affects CLI banner, config paths, and environment variable names.

## Path Resolution

Three execution modes: npm install, standalone binary, tsx from source.

**Always use `src/config.ts`** for package assets:

```typescript
import { getPackageDir, getThemeDir } from "./config.js";
```

Never use `__dirname` directly for package assets.

## Debug Command

`/debug` (hidden) writes to `~/.letty/agent/letty-debug.log`:
- Rendered TUI lines with ANSI codes
- Last messages sent to the LLM

## Testing

```bash
./test.sh                         # Run non-LLM tests (no API keys needed)
npm test                          # Run all tests
npm test -- test/specific.test.ts # Run specific test
```

### Published package smoke test

After building, run `npm run check:package-install`. It packs the public packages and installs only coding-agent as a direct dependency in a temporary directory outside the repository. Local tarball overrides select declared transitive dependencies without installing development-only packages. The check verifies SDK imports and CLI startup without credentials or model requests.

`npm run check` also checks runtime dependency declarations and rejects excluded development sources pulled into a package's build through imports.

## Project Structure

```
packages/
  ai/           # LLM provider abstraction
  agent/        # Agent loop and message types  
  tui/          # Terminal UI components
  coding-agent/ # CLI and interactive mode
```
