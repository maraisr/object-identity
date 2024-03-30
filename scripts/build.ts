import { build, emptyDir } from '@deno/dnt';

await emptyDir('./npm');

await build({
	entryPoints: ['./mod.ts'],
	outDir: './npm',
	shims: {
		deno: 'dev',
	},

	declaration: 'inline',
	declarationMap: false,
	scriptModule: 'cjs',
	typeCheck: 'both',
	test: true,

	importMap: 'deno.json',

	package: {
		name: 'object-identity',
		version: Deno.args[0],
		repository: 'maraisr/object-identity',
		license: 'MIT',
		author: {
			name: 'Marais Rososuw',
			email: 'me@marais.dev',
			url: 'https://marais.io',
		},
		keywords: [
			'object',
			'identity',
			'hash',
			'fingerprint',
		],
	},

	compilerOptions: {
		target: 'ES2022',
		lib: ['ES2022', 'WebWorker'],
	},

	filterDiagnostic(diag) {
		let txt = diag.messageText.toString();
		return !txt.includes(
			// ignore type error for missing Deno built-in information
			`Type 'ReadableStream<string>' must have a '[Symbol.asyncIterator]()' method that returns an async iterator`,
		);
	},

	async postBuild() {
		await Deno.copyFile('license', 'npm/license');
		await Deno.copyFile('readme.md', 'npm/readme.md');
	},
});
