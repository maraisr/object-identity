import { B } from 'mitata';
import { parseArgs } from 'node:util';

type BenchmarkOptions = {
	fn: ConstructorParameters<typeof B>[1];
	group?: string;
	baseline?: boolean;
};

type BenchmarkRow = { name: string; ops: number; baseline: boolean };
type BenchmarkGroup = { name: string; rows: BenchmarkRow[] };

const groups = new Map<string, BenchmarkGroup>();

export async function bench(
	name: string,
	options: BenchmarkOptions | BenchmarkOptions['fn'],
): Promise<void> {
	if (typeof options === 'function') options = { fn: options };
	const { fn, group = name, baseline = false } = options;
	const trial = await new B(name, fn).run(true);
	const avg = trial.runs[0]?.stats?.avg;
	if (trial.runs.length !== 1 || avg === undefined || !Number.isFinite(avg) || avg <= 0) {
		throw new Error(`Invalid benchmark result: ${name}`);
	}

	let result = groups.get(group);
	if (!result) {
		result = { name: group, rows: [] };
		groups.set(group, result);
	}
	result.rows.push({ name, ops: Math.round(1e9 / avg), baseline });
}

const nf = new Intl.NumberFormat('en-AU');
const opsWidth = (rows: BenchmarkRow[]) =>
	Math.max(0, ...rows.map((row) => nf.format(row.ops).length));

function line(row: BenchmarkRow, nameWidth: number, width: number, relative = ''): string {
	return `✔ ${row.name.padEnd(nameWidth)}  ${nf.format(row.ops).padStart(width)} ops/sec${relative}`;
}

function formatBenchmarks(groups: BenchmarkGroup[]): { summary: string; details: string } {
	if (groups.length === 0) throw new Error('No benchmark groups to format');
	const baselines = groups.map((group) => group.rows.find((row) => row.baseline) ?? group.rows[0]);
	const nameWidth = Math.max(...groups.map((group) => group.name.length));
	const width = opsWidth(baselines);
	const summary = baselines
		.map((row, index) => line({ ...row, name: groups[index].name }, nameWidth, width))
		.join('\n');
	const details = groups
		.map((group, index) => {
			const baseline = baselines[index];
			const nameWidth = Math.max(...group.rows.map((row) => row.name.length));
			const width = opsWidth(group.rows);
			const relatives = group.rows.map((row) =>
				row !== baseline ? `${(baseline.ops / row.ops).toFixed(2)}x` : '',
			);
			const relativeWidth = Math.max(...relatives.map((value) => value.length));
			const rows = group.rows.map((row, index) => {
				const isBaseline = row === baseline;
				const relative = relatives[index] ? `  ${relatives[index].padStart(relativeWidth)}` : '';
				return `${isBaseline ? '+ ' : '  '}${line(row, nameWidth, width, relative)}`;
			});
			return `${group.name}\n${rows.join('\n')}`;
		})
		.join('\n\n');
	return { summary, details };
}

const {
	values: { format },
} = parseArgs({
	options: { format: { type: 'string', default: 'text' } },
});

if (format !== 'text' && format !== 'markdown') {
	throw new Error('Expected --format to be text or markdown');
}

process.once('beforeExit', (code) => {
	if (code !== 0 || groups.size === 0) return;
	const { summary, details } = formatBenchmarks([...groups.values()]);
	if (format === 'markdown') {
		console.log(
			[
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
			].join('\n'),
		);
	} else {
		console.log(`${summary}\n\n${details}`);
	}
});
