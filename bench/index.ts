import { suite } from 'npm:@marais/bench';

import objectHash from 'npm:object-hash';
import jsonStableStringify from 'npm:json-stable-stringify';
import { stringify as tinyStableStringify } from 'npm:tiny-stable-stringify';

import { identify } from '../mod.ts';

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

suite<any>(
	{
		'object-identity'() {
			return (o) => identify(o);
		},
		'object-hash'() {
			const options = { algorithm: 'passthrough', unorderedSets: false };

			return (o) => objectHash(o, options);
		},
		'json-stable-stringify'() {
			return (o) => jsonStableStringify(o);
		},
		'tiny-stable-stringify'() {
			return (o) => tinyStableStringify(o);
		},
	},
	(run) => {
		const o = getObject();
		run(undefined, () => o);
	},
	{
		size: 50,
		iter: 10_000,
	},
);
