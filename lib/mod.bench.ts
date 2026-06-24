import objectHash from 'object-hash';
import jsonStableStringify from 'json-stable-stringify';
import { stringify as tinyStableStringify } from 'tiny-stable-stringify';

import { identify } from './mod.ts';

const getObject = () => {
	const c = [1];
	// @ts-expect-error circular
	c.push(c);
	return {
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
		d: new Date(),
		r: /a/,
	};
};

Deno.bench({
	name: 'object-identity',
	baseline: true,
	fn() {
		let _ = identify(getObject());
	},
});

Deno.bench({
	name: 'object-hash',
	fn() {
		const options = { algorithm: 'passthrough', unorderedSets: false };
		let _ = objectHash(getObject(), options);
	},
});

Deno.bench({
	name: 'json-stable-stringify',
	fn() {
		let _ = jsonStableStringify(getObject());
	},
});

Deno.bench({
	name: 'tiny-stable-stringify',
	fn() {
		let _ = tinyStableStringify(getObject());
	},
});
