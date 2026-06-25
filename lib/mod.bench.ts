// deno-lint-ignore-file no-import-prefix

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
		lib: () => import('npm:safe-stable-stringify@^2.5'),
		run: (m, o) => m.default(o),
	},
	ohash: {
		lib: () => import('npm:ohash@^2.0'),
		run: (m, o) => m.serialize(o),
	},
	'object-hash': {
		lib: () => import('npm:object-hash@^3.0'),
		run: (m, o) => m.default(o, { algorithm: 'passthrough' }),
	},
	'hash-it †': {
		lib: () => import('npm:hash-it@^7.0'),
		run: (m, o) => m.hash(o),
	},
	'json-stable-stringify': {
		lib: () => import('npm:json-stable-stringify@^1.3'),
		run: (m, o) => m.default(o),
	},
	'fast-json-stable-stringify': {
		lib: () => import('npm:fast-json-stable-stringify@^2.1'),
		run: (m, o) => m.default(o, { cycles: true }),
	},
	'tiny-stable-stringify': {
		lib: () => import('npm:tiny-stable-stringify@^0.1'),
		run: (m, o) => m.stringify(o),
	},
	'json-stringify-deterministic': {
		lib: () => import('npm:json-stringify-deterministic@^1.0'),
		run: (m, o) => m.default(o, { cycles: true }),
	},
	'json-stable-stringify-without-jsonify': {
		lib: () => import('npm:json-stable-stringify-without-jsonify@^1.0'),
		run: (m, o) => m.default(o),
	},
	'json-sorted-stringify': {
		lib: () => import('npm:json-sorted-stringify@^1.0'),
		run: (m, o) => m.default(o),
	},
	canonicalize: {
		lib: () => import('npm:canonicalize@^3.0'),
		run: (m, o) => m.default(o),
	},
	'@tufjs/canonical-json': {
		lib: () => import('npm:@tufjs/canonical-json@^2.0'),
		run: (m, o) => m.canonicalize(o),
	},
};

const mods: Record<string, any> = {};
for (const [name, c] of Object.entries(candidates)) mods[name] = await c.lib();

const fixtures = Object.entries(scenarios).map(([name, make]) => [name, make()] as const);

for (const [scenario, value] of fixtures) {
	for (const [name, c] of Object.entries(candidates)) {
		// Validate up front: a throw (can't handle the shape) or non-deterministic
		// output marks the bench ignored, so it's skipped instead of measured.
		let valid = false;
		try {
			valid = c.run(mods[name], value) === c.run(mods[name], value);
		} catch {
			/* leaves valid false -> ignored */
		}

		Deno.bench({
			name,
			group: scenario,
			baseline: name === 'object-identity',
			ignore: !valid,
			fn: () => void c.run(mods[name], value),
		});
	}
}
