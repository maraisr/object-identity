import { suite } from '@marais/bench';

import { createHash } from 'crypto';
import objectHash from 'object-hash';
import { identify } from 'object-identity';

const getObject = () => {
	const c = [1];
	// @ts-ignore
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] } };
};

suite(
	{
		['object-identity']() {
			return (o) => identify(o);
		},
		['object-hash']() {
			const options = { algorithm: 'passthrough', unorderedSets: false };

			return (o) => objectHash(o, options);
		},

		['object-identity :: hashed']() {
			const hasher = (val) => createHash('sha1').update(val).digest('hex');

			return (o) => identify(o, hasher);
		},
		['object-hash :: hashed']() {
			const options = {
				algorithm: 'sha1',
				encoding: 'hex',
				unorderedSets: false,
			};

			return (o) => objectHash(o, options);
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
