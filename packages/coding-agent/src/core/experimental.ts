export function areExperimentalFeaturesEnabled(): boolean {
	return process.env.LETTY_EXPERIMENTAL === "1";
}
