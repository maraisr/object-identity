import type { UserConfig } from 'tsdown';

const config: UserConfig = {
	entry: { index: 'lib/mod.ts' },
	format: ['esm', 'cjs'],
	platform: 'neutral',
	target: 'esnext',
	dts: true,
};

export default config;
