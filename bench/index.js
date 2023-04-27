import { createHash } from 'crypto';
import objectHash from 'object-hash';
import { identify } from 'object-identity';

import { EMPTY, suite } from '@thi.ng/bench';

const getObject = () => {
	const c = [1];
	// @ts-ignore
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] } };
};

const contenders = {
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
};

runner(contenders);

async function runner(contenders) {
	const cases = [];
	for (const [name, contender] of Object.entries(contenders)) {
		const run = contender();
		const o = getObject();
		const fn = () => run(o);
		cases.push({ fn, title: name });
	}

	suite(cases, {
		warmup: 300,
		size: 50,
		iter: 10_000,
		format: FORMAT(),
	});
}

function FORMAT() {
	const formatter = new Intl.NumberFormat('en-US');
	return {
		prefix: EMPTY,
		suffix: EMPTY,
		start: EMPTY,
		warmup: EMPTY,
		result: EMPTY,
		total(a) {
			const winner = a.slice().sort((a, b) => a.mean - b.mean)[0];
			const compute = a.map((x) => {
				return {
					title: x.title,
					won: x === winner,
					ops: formatter.format(
						Math.floor((x.iter * x.size) / (x.total / 1000)),
					),
					sd: (x.sd / 1000).toFixed(2),
				};
			});
			const max_name = Math.max(...a.map((x) => x.title.length));
			const max_ops = Math.max(...compute.map((x) => x.ops.length));
			const lines = [];
			for (const x of compute) {
				const won = x.won ? '★ ' : '  ';
				lines.push(
					`${won}${x.title.padEnd(max_name)} ~ ${x.ops.padStart(
						max_ops,
					)} ops/sec ± ${x.sd}%`,
				);
			}
			return lines.join('\n');
		},
	};
}
