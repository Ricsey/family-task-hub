export const authConfig = {
	publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,

	validate() {
		if (!this.publishableKey) {
			throw new Error(
				"Missing VITE_CLERK_PUBLISHABLE_KEY environment variable",
			);
		}
	},
} as const;

authConfig.validate();
