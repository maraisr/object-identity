// @ts-nocheck

import { Suite } from 'benchmark';
import { createHash } from 'crypto';
import objectHash from 'object-hash';
import { identify } from '..';

async function runner(name: string, candidates: Record<string, Function>) {
	const sorted_candidates = Object.entries(candidates).sort(([a], [b]) =>
		a.localeCompare(b),
	);

	// ~ Benchmarking

	const suite = new Suite();
	const previous = suite.add.bind(suite);
	suite.on('cycle', (e) => console.log('  ' + e.target));
	suite.add = (name, runner) => previous(name.padEnd(20), runner);

	for (const [name, fn] of sorted_candidates) {
		const instance = fn();
		suite.add(name, instance);
	}

	console.log(`\nbenchmark :: ${name}`);
	suite.run();
}

const getObject = () => {
	const c = [1];
	// @ts-ignore
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] } };
};

runner('hashed', {
	['object-identity']() {
		const hasher = (val) => createHash('sha1').update(val).digest('hex');

		return () => {
			return identify(getObject(), hasher);
		};
	},
	['object-hash']() {
		const options = { algorithm: 'sha1', encoding: 'hex', unorderedSets: false };

		return () => {
			return objectHash(getObject(), options);
		};
	},
});

runner('passed through', {
	['object-identity']() {
		const hasher = (val) => val;

		return () => {
			return identify(getObject(), hasher);
		};
	},
	['object-hash']() {
		const options = { algorithm: 'passthrough', unorderedSets: false };
		const hash = objectHash(getObject(), options);

		return () => {
			return objectHash(getObject(), options);
		};
	},
});

