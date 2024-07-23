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

suite<unknown>(
	{
		'object-identity'() {
			return () => identify(getObject());
		},
		'object-hash'() {
			const options = { algorithm: 'passthrough', unorderedSets: false };
			return () => objectHash(getObject(), options);
		},
		'json-stable-stringify'() {
			return () => jsonStableStringify(getObject());
		},
		'tiny-stable-stringify'() {
			return () => tinyStableStringify(getObject());
		},
	},
	(run) => {
		run(undefined);
	},
	{
		size: 50,
		iter: 10_000,
	},
);
