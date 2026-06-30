const BASELINE = 'object-identity';

const { stdout } = await new Deno.Command('deno', {
	args: ['bench', '-A', '--json', 'lib/mod.bench.ts'],
	stdout: 'piped',
	stderr: 'null',
}).output();

const report = JSON.parse(new TextDecoder().decode(stdout));

type Row = { name: string; ok: boolean; ops?: number };

const groups: string[] = [];
const order: string[] = []; // candidate union, in first-seen (registration) order
const seen = new Set<string>();
const metric: Record<string, Record<string, Row>> = {};

for (const b of report.benches as Array<Record<string, any>>) {
	if (!metric[b.group]) ((metric[b.group] = {}), groups.push(b.group));
	if (!seen.has(b.name)) (seen.add(b.name), order.push(b.name));

	const ok = b.results?.[0]?.ok;
	if (!ok) continue;

	metric[b.group][b.name] = {
		name: b.name,
		ok: true,
		ops: Math.round(1e9 / ok.avg),
	};
}

const rows: Record<string, Row[]> = {};

for (const g of groups) rows[g] = order.map((name) => metric[g][name] ?? { name, ok: false });

const nf = new Intl.NumberFormat('en-AU');

function line(r: Row, label: string, nameW: number, opsW: number, rel = ''): string {
	const mark = r.ok ? '✔' : '✘';
	if (r.ops == null) return `${mark} ${label}`;
	const tail = rel.trim() ? `  ${rel}` : '';
	return `${mark} ${label.padEnd(nameW)}  ${nf.format(r.ops).padStart(opsW)} ops/sec${tail}`;
}

const opsW = (rs: Row[]) =>
	Math.max(0, ...rs.map((r) => (r.ops != null ? nf.format(r.ops).length : 0)));

// Top: just this library, one row per shape (the readme set).
const baseline = groups.map((g) => rows[g].find((x) => x.name === BASELINE)!);
const sumNameW = Math.max(...groups.map((g) => g.length));
const sumOpsW = opsW(baseline);
const summary = groups.map((g, k) => line(baseline[k], g, sumNameW, sumOpsW)).join('\n');

const details = groups
	.map((g) => {
		const nameW = Math.max(...rows[g].map((r) => r.name.length));
		const w = [nameW, opsW(rows[g])] as const;

		const base = rows[g].find((r) => r.name === BASELINE);
		const rel = (r: Row) =>
			base?.ops && r.ops && r.name !== BASELINE ? `${(base.ops / r.ops).toFixed(2)}x` : '';
		const relW = Math.max(0, ...rows[g].map((r) => rel(r).length));

		const lines = rows[g].map((r) => {
			const body = line(r, r.name, ...w, rel(r).padStart(relW));
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
