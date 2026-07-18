// deno-lint-ignore-file no-import-prefix
import { do_not_optimize, measure } from 'mitata';
import { getHeapStatistics } from 'node:v8';

// --- scenarios -------------------------------------------------------------

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

// --- candidates ------------------------------------------------------------

const BASELINE = 'object-identity';

const candidates: Record<
	string,
	{
		lib: () => Promise<any>;
		run: (mod: any, value: any) => unknown;
	}
> = {
	'object-identity': {
		lib: () => import('../lib/mod.ts'),
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
	'swr/_internal/stableHash': {
		lib: () => import('npm:swr@^2.4/_internal'),
		run: (m, o) => m.stableHash(o),
	},
};

// --- measure ---------------------------------------------------------------

if (typeof (globalThis as { gc?: () => void }).gc !== 'function') {
	console.error(
		'allocation stats need manual gc — run: deno run -A --v8-flags=--expose-gc scripts/bench.ts',
	);
	Deno.exit(1);
}

const gc = (globalThis as unknown as { gc: () => void }).gc;

// Enough calls to amortize V8's allocation-counter granularity without making
// the memory pass dominate the timing benchmark.
const allocationSamples: Record<string, number> = {
	simple: 3_000,
	deep: 750,
	'deep circular': 750,
	big: 75,
	leafy: 250,
};

function totalAllocated(): number {
	return (getHeapStatistics() as ReturnType<typeof getHeapStatistics> & {
		total_allocated_bytes: number;
	}).total_allocated_bytes;
}

function allocatedPerCall(make: () => unknown, run: (value: unknown) => unknown, count: number) {
	const inputs = Array.from({ length: count }, make);

	// Subtract the loop and allocation-counter overhead from the candidate run.
	gc();
	let before = totalAllocated();
	for (let i = 0; i < count; i++) do_not_optimize(inputs[i]);
	const control = totalAllocated() - before;

	gc();
	before = totalAllocated();
	for (let i = 0; i < count; i++) do_not_optimize(run(inputs[i]));
	const allocated = totalAllocated() - before - control;

	return Math.max(0, allocated / count);
}

const mods: Record<string, any> = {};
for (const [name, c] of Object.entries(candidates)) mods[name] = await c.lib();

type Row = { name: string; ok: boolean; ops?: number; mem?: number };

const groups = Object.keys(scenarios);
const order = Object.keys(candidates); // candidate union, in registration order
const metric: Record<string, Record<string, Row>> = {};

for (const group of groups) {
	metric[group] = {};
	const make = scenarios[group];

	for (const name of order) {
		const mod = mods[name];
		const run = candidates[name].run;

		// Validate up front: a throw (can't handle the shape) or non-deterministic
		// output marks the candidate failed, so it's skipped instead of measured.
		let valid = false;
		try {
			const o = make();
			valid = run(mod, o) === run(mod, o);
		} catch {
			/* leaves valid false -> skipped */
		}

		if (!valid) {
			metric[group][name] = { name, ok: false };
			continue;
		}

		// A computed param provides a fresh input without including fixture creation
		// in the timing and prevents the JIT from hoisting work out of the loop.
		const stats = await measure(function* () {
			yield {
				[0]() {
					return make();
				},
				bench(v: any) {
					return do_not_optimize(run(mod, v));
				},
			};
		});

		const mem = allocatedPerCall(make, (value) => run(mod, value), allocationSamples[group]);

		metric[group][name] = {
			name,
			ok: true,
			ops: Math.round(1e9 / stats.avg),
			mem,
		};
	}
}

// --- format ----------------------------------------------------------------

const rows: Record<string, Row[]> = {};
for (const g of groups) rows[g] = order.map((name) => metric[g][name]);

const nf = new Intl.NumberFormat('en-AU');
const kb = (b: number) => `${(b / 1024).toFixed(2)} kb/op`;

const srel = (r: Row, base?: Row) =>
	base?.ops && r.ops && r.name !== BASELINE ? `${(base.ops / r.ops).toFixed(2)}x` : '';
// memory: lower is better, so candidate/baseline — >1x means object-identity wins
const mrel = (r: Row, base?: Row) =>
	base?.mem && r.mem && r.name !== BASELINE ? `${(r.mem / base.mem).toFixed(2)}x` : '';

type W = { name: number; ops: number; srel: number; mem: number; mrel: number };

const widths = (rs: Row[], base: Row | undefined, rel: boolean): W => ({
	name: Math.max(...rs.map((r) => r.name.length)),
	ops: Math.max(0, ...rs.map((r) => (r.ops != null ? nf.format(r.ops).length : 0))),
	mem: Math.max(0, ...rs.map((r) => (r.mem != null ? kb(r.mem).length : 0))),
	srel: !rel ? 0 : Math.max(0, ...rs.map((r) => srel(r, base).length)),
	mrel: !rel ? 0 : Math.max(0, ...rs.map((r) => mrel(r, base).length)),
});

function line(r: Row, label: string, base: Row | undefined, w: W, rel: boolean): string {
	const mark = r.ok ? '✔' : '✘';
	if (r.ops == null) return `${mark} ${label}`;

	let s = `${mark} ${label.padEnd(w.name)}  ${nf.format(r.ops).padStart(w.ops)} ops/sec`;
	if (rel) s += `  ${srel(r, base).padStart(w.srel)}`;
	s += `   ${(r.mem != null ? kb(r.mem) : '').padStart(w.mem)}`;
	if (rel) s += `  ${mrel(r, base).padStart(w.mrel)}`;

	return s.replace(/\s+$/, '');
}

// Top: just this library, one row per shape (the readme set).
const baseline = groups.map((g) => rows[g].find((x) => x.name === BASELINE)!);
const sumW = widths(baseline.map((r, k) => ({ ...r, name: groups[k] })), undefined, false);
const summary = groups.map((g, k) => line(baseline[k], g, undefined, sumW, false)).join('\n');

const details = groups
	.map((g) => {
		const base = rows[g].find((r) => r.name === BASELINE);
		const w = widths(rows[g], base, true);

		const lines = rows[g].map((r) => {
			const body = line(r, r.name, base, w, true);
			return r.name === BASELINE ? `+ ${body}` : `  ${body}`;
		});

		return `${g}\n${lines.join('\n')}`;
	})
	.join('\n\n');

const block = [
	'',
	'```',
	summary,
	'```',
	'',
	'<details><summary>All candidates</summary>',
	'',
	'```diff',
	details,
	'```',
	'',
	'</details>',
	'',
	'_Memory is gross V8 heap allocation per operation; fixture construction is excluded._',
	'',
].join('\n');

const BEGIN = '<!-- BEGIN BENCHMARK -->';
const END = '<!-- END BENCHMARK -->';

let readme = await Deno.readTextFile('readme.md');
const i = readme.indexOf(BEGIN);
const j = readme.indexOf(END);
readme = readme.slice(0, i + BEGIN.length) + block + readme.slice(j);
await Deno.writeTextFile('readme.md', readme);

await new Deno.Command('deno', { args: ['fmt', 'readme.md'], stdout: 'null', stderr: 'null' })
	.output();

console.log('patched (%d groups, %d candidates)', groups.length, rows[groups[0]].length);
