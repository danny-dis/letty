export function getLettyUserAgent(version: string): string {
	const runtime = process.versions.bun ? `bun/${process.versions.bun}` : `node/${process.version}`;
	return `letty/${version} (${process.platform}; ${runtime}; ${process.arch})`;
}
