// Credit @lukeed https://github.com/lukeed/empathic/blob/main/scripts/build.ts

// Publish:
//   -> edit package.json version
//   -> edit deno.json version
//   $ git commit "release: x.x.x"
//   $ git tag "vx.x.x"
//   $ git push origin main --tags
//   #-> CI builds w/ publish

import oxc from 'oxc-transform';
import { minify } from 'oxc-minify';
import { join, resolve } from '@std/path';

import denoJson from '../deno.json' with { type: 'json' };

const outdir = resolve('npm');

let Inputs;
if (typeof denoJson.exports === 'string') Inputs = { '.': denoJson.exports };
else Inputs = denoJson.exports;

async function transform(name: string, filename: string) {
	if (name === '.') name = 'index';
	name = name.replace(/^\.\//, '');

	let entry = resolve(filename);
	let source = await Deno.readTextFile(entry);

	let xform = oxc.transform(entry, source, {
		typescript: {
			onlyRemoveTypeImports: true,
			declaration: {
				stripInternal: true,
			},
		},
	});

	if (xform.errors.length > 0) bail('transform', xform.errors);

	let outfile = `${outdir}/${name}.d.mts`;
	console.log('> writing "%s" file', outfile);
	await Deno.writeTextFile(outfile, xform.declaration!);

	outfile = `${outdir}/${name}.mjs`;
	console.log('> writing "%s" file', outfile);
	await Deno.writeTextFile(outfile, xform.code);

	// We ship the readable ESM above; downstream bundlers minify it, so the
	// minified + gzipped size is the number that actually ships to users.
	// Measure and report it — this minified output is never written to disk.
	// Cue from @lukeed https://github.com/lukeed/empathic/blob/main/scripts/build.ts
	let min = minify(`${name}.mjs`, xform.code, { mangle: { toplevel: true } });
	if (!min.code) bail('minify', ['produced no output']);
	console.log(
		'::notice::%s is %d b minified, %d b min+gzip',
		`${name}.mjs`,
		utf8(min.code),
		await gzipSize(min.code),
	);
}

if (exists(outdir)) {
	console.log('! removing "npm" directory');
	await Deno.remove(outdir, { recursive: true });
}
await Deno.mkdir(outdir);

for (let [name, filename] of Object.entries(Inputs)) await transform(name, filename);

await copy('package.json');
await copy('readme.md');
await copy('license');

// ---

function bail(label: string, errors: string[]): never {
	console.error('[%s] error(s)\n', label, errors.join(''));
	Deno.exit(1);
}

function utf8(text: string): number {
	return new TextEncoder().encode(text).length;
}

async function gzipSize(text: string): Promise<number> {
	let stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
	let size = 0;
	for await (let chunk of stream) size += chunk.length;
	return size;
}

function exists(path: string) {
	try {
		Deno.statSync(path);
		return true;
	} catch (_) {
		return false;
	}
}

function copy(file: string) {
	if (exists(file)) {
		let outfile = join(outdir, file);
		console.log('> writing "%s" file', outfile);
		return Deno.copyFile(file, outfile);
	}
}
