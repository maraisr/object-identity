import { suite } from '@marais/bench';

import objectHash from 'object-hash';
import { identify } from 'object-identity';
import jsonStableStringify from 'json-stable-stringify';

const getObject = () => {
	const c = [1];
	// @ts-ignore
	c.push(c);
	return {
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
		d: new Date(),
		r: /a/,
	};
};

suite(
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
