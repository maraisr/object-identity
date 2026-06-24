// deno-lint-ignore-file no-import-prefix

import objectHash from 'npm:object-hash@^3.0';
import { serialize as ohashSerialize } from 'npm:ohash@^2.0';
import { objectStringify as liqdObjectStringify } from 'npm:@liqd-js/fast-object-hash@^2.0';
import { hash as hashIt } from 'npm:hash-it@^7.0';
import jsonStableStringify from 'npm:json-stable-stringify@^1.3';
import fastJsonStableStringify from 'npm:fast-json-stable-stringify@^2.1';
import { stringify as tinyStableStringify } from 'npm:tiny-stable-stringify@^0.1';
import safeStableStringify from 'npm:safe-stable-stringify@^2.5';
import jsonStringifyDeterministic from 'npm:json-stringify-deterministic@^1.0';
import jsonStableStringifyWithoutJsonify from 'npm:json-stable-stringify-without-jsonify@^1.0';
import emeraldJsonStableStringify from 'npm:@emeraldsquad/json-stable-stringify@^1.0';
import fasterStableStringify from 'npm:faster-stable-stringify@^1.0';
import canonicalize from 'npm:canonicalize@^3.0';
import { canonicalize as jsonCanonicalize } from 'npm:json-canonicalize@^2.0';
import canonicalJson from 'npm:canonical-json@^0.4';
import { canonicalize as tufCanonicalize } from 'npm:@tufjs/canonical-json@^2.0';

import { identify } from './mod.ts';

function get_object() {
	const c = [1];
	// @ts-expect-error circular
	c.push(c);
	return {
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
		d: new Date(),
		r: /a/,
	};
}

Deno.bench({
	name: 'object-identity',
	baseline: true,
	fn() {
		let _ = identify(get_object());
	},
});

Deno.bench({
	name: 'object-hash',
	fn() {
		let _ = objectHash(get_object(), { algorithm: 'passthrough' });
	},
});

Deno.bench({
	name: 'ohash',
	fn() {
		let _ = ohashSerialize(get_object());
	},
});

Deno.bench({
	name: '@liqd-js/fast-object-hash',
	fn() {
		let _ = liqdObjectStringify(get_object());
	},
});

Deno.bench({
	name: 'hash-it †',
	fn() {
		let _ = hashIt(get_object());
	},
});

Deno.bench({
	name: 'json-stable-stringify',
	fn() {
		let _ = jsonStableStringify(get_object());
	},
});

Deno.bench({
	name: 'fast-json-stable-stringify',
	fn() {
		let _ = fastJsonStableStringify(get_object());
	},
});

Deno.bench({
	name: 'faster-stable-stringify',
	fn() {
		let _ = fasterStableStringify(get_object());
	},
});

Deno.bench({
	name: 'tiny-stable-stringify',
	fn() {
		let _ = tinyStableStringify(get_object());
	},
});

Deno.bench({
	name: 'safe-stable-stringify',
	fn() {
		let _ = safeStableStringify(get_object());
	},
});

Deno.bench({
	name: 'json-stringify-deterministic',
	fn() {
		let _ = jsonStringifyDeterministic(get_object());
	},
});

Deno.bench({
	name: 'json-stable-stringify-without-jsonify',
	fn() {
		let _ = jsonStableStringifyWithoutJsonify(get_object());
	},
});

Deno.bench({
	name: '@emeraldsquad/json-stable-stringify',
	fn() {
		let _ = emeraldJsonStableStringify(get_object());
	},
});

Deno.bench({
	name: 'canonicalize',
	fn() {
		let _ = canonicalize(get_object());
	},
});

Deno.bench({
	name: 'json-canonicalize',
	fn() {
		let _ = jsonCanonicalize(get_object());
	},
});

Deno.bench({
	name: 'canonical-json',
	fn() {
		let _ = canonicalJson(get_object());
	},
});

Deno.bench({
	name: '@tufjs/canonical-json',
	fn() {
		let _ = tufCanonicalize(get_object());
	},
});
