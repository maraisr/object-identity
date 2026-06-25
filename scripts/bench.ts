const BASELINE = 'object-identity';

const { stdout } = await new Deno.Command('deno', {
	args: ['bench', '-A', '--json', 'lib/mod.bench.ts'],
	stdout: 'piped',
	stderr: 'null',
}).output();

const report = JSON.parse(new TextDecoder().decode(stdout));

type Row = { name: string; ok: boolean; avg?: number; ops?: number; jitter?: number };

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
		avg: ok.avg, // nanoseconds
		ops: Math.round(1e9 / ok.avg),
		// no stddev, so approximate jitter from p75 vs avg.
		jitter: (Math.abs(ok.p75 - ok.avg) / ok.avg) * 100,
	};
}

const rows: Record<string, Row[]> = {};

for (const g of groups) rows[g] = order.map((name) => metric[g][name] ?? { name, ok: false });

const nf = new Intl.NumberFormat('en-AU');

function dur(ns: number): string {
	if (ns < 1e3) return `${ns.toFixed(1)}ns`;
	if (ns < 1e6) return `${(ns / 1e3).toFixed(1)}µs`;
	return `${(ns / 1e6).toFixed(1)}ms`;
}

function line(r: Row, label: string, nameW: number, avgW: number, opsW: number): string {
	const mark = r.ok ? '✔' : '✘';
	if (r.ops == null) return `${mark} ${label}`;
	return `${mark} ${label.padEnd(nameW)} ~ ${dur(r.avg!).padStart(avgW)} @ ${
		nf
			.format(r.ops)
			.padStart(opsW)
	} ops/sec ± ${r.jitter!.toFixed(2)}%`;
}

const avgW = (rs: Row[]) => Math.max(0, ...rs.map((r) => (r.avg != null ? dur(r.avg).length : 0)));
const opsW = (rs: Row[]) =>
	Math.max(0, ...rs.map((r) => (r.ops != null ? nf.format(r.ops).length : 0)));

// Top: just this library, one row per shape (the readme set).
const baseline = groups.map((g) => rows[g].find((x) => x.name === BASELINE)!);
const sumNameW = Math.max(...groups.map((g) => g.length));
const sumAvgW = avgW(baseline);
const sumOpsW = opsW(baseline);
const summary = groups.map((g, k) => line(baseline[k], g, sumNameW, sumAvgW, sumOpsW)).join('\n');

// Details: every candidate, grouped by shape, with the winner called out.
const details = groups
	.map((g) => {
		const nameW = Math.max(...rows[g].map((r) => r.name.length));
		const w = [nameW, avgW(rows[g]), opsW(rows[g])] as const;
		const lines = rows[g].map((r) => line(r, r.name, ...w));

		// Fastest candidate wins; note how far ahead of the next best it is.
		const ranked = rows[g].filter((r) => r.ops != null).sort((a, b) => b.ops! - a.ops!);
		const [win, alt] = ranked;
		if (win) {
			const ahead = alt ? ` (${(win.ops! / alt.ops!).toFixed(2)}x faster than ${alt.name})` : '';
			lines.push('─'.repeat(Math.max(...lines.map((l) => l.length))), `⭐︎ ${win.name}${ahead}`);
		}

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
	'```',
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
