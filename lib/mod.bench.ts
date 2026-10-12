import { bench } from '../scripts/bench.ts';

const scenarios: Record<string, () => unknown> = {
	simple() {
		return {
			id: 1234,
			name: 'object-identity',
			active: true,
			score: 98.6,
			tags: ['canonical', 'stable', 'fast'],
			meta: {
				created: 1_700_000_000_000,
				version: '0.1.2',
				nested: { a: 1, b: 2, c: 3 },
			},
			items: [
				{ k: 'one', v: 1 },
				{ k: 'two', v: 2 },
				{ k: 'three', v: 3 },
			],
		};
	},

	deep() {
		let node: any = { leaf: true, value: 0 };
		for (let i = 0; i < 32; i++) {
			node = { depth: i, label: 'node-' + i, sibling: [i, i + 1], child: node };
		}
		return node;
	},

	'deep circular'() {
		const root: any = { id: 'root' };
		let node: any = root;
		for (let i = 0; i < 32; i++) {
			node.next = { depth: i, root };
			node = node.next;
		}
		node.next = root;
		return root;
	},

	big() {
		const out: Record<string, unknown> = {};
		for (let i = 0; i < 256; i++) {
			out['key_' + i] = { i, label: 'item-' + i, on: i % 2 === 0, tags: ['a', 'b', 'c'] };
		}
		return out;
	},

	leafy() {
		const out: unknown[] = [];
		for (let i = 0; i < 512; i++) out.push(i, 'str-' + i, i % 3 === 0, null);
		return out;
	},
};

const candidates: Record<
	string,
	{
		lib: () => Promise<any>;
		run: (mod: any, value: any) => unknown;
	}
> = {
	'object-identity': {
		lib: () => import('./mod.ts'),
		run: (m, o) => m.identify(o),
	},
	'safe-stable-stringify': {
		lib: () => import('safe-stable-stringify'),
		run: (m, o) => m.default(o),
	},
	ohash: {
		lib: () => import('ohash'),
		run: (m, o) => m.serialize(o),
	},
	'object-hash': {
		lib: () => import('object-hash'),
		run: (m, o) => m.default(o, { algorithm: 'passthrough' }),
	},
	'hash-it †': {
		lib: () => import('hash-it'),
		run: (m, o) => m.hash(o),
	},
	'json-stable-stringify': {
		lib: () => import('json-stable-stringify'),
		run: (m, o) => m.default(o),
	},
	'fast-json-stable-stringify': {
		lib: () => import('fast-json-stable-stringify'),
		run: (m, o) => m.default(o, { cycles: true }),
	},
	'tiny-stable-stringify': {
		lib: () => import('tiny-stable-stringify'),
		run: (m, o) => m.stringify(o),
	},
	'json-stringify-deterministic': {
		lib: () => import('json-stringify-deterministic'),
		run: (m, o) => m.default(o, { cycles: true }),
	},
	'json-sorted-stringify': {
		lib: () => import('json-sorted-stringify'),
		run: (m, o) => m.default(o),
	},
	canonicalize: {
		lib: () => import('canonicalize'),
		run: (m, o) => m.default(o),
	},
	'swr/_internal/stableHash': {
		lib: () => import('swr/_internal'),
		run: (m, o) => m.stableHash(o),
	},
	'@tufjs/canonical-json': {
		lib: () => import('@tufjs/canonical-json'),
		run: (m, o) => m.canonicalize(o),
	},
};

for (const [scenario, value] of Object.entries(scenarios)) {
	for (const [name, candidate] of Object.entries(candidates)) {
		const mod = await candidate.lib();
		const baseline = name === 'object-identity';

		const run = candidate.run.bind(0, mod);

		try {
			const input = value();
			if (run(input) !== run(input)) {
				throw new Error('Non-deterministic output');
			}
		} catch (error) {
			if (baseline) throw error;
			const reason = error instanceof Error ? error.message : String(error);
			console.error(`[skip] ${scenario} / ${name}: ${reason}`);
			continue;
		}

		await bench(name, {
			group: scenario,
			baseline,
			fn: function* () {
				yield {
					// Computed parameters keep fresh-input allocation outside the timer.
					0: value,
					bench(input: unknown) {
						return run(input);
					},
				};
			},
		});
	}
}
