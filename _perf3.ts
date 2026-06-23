// lazy-placeholder vs eager. Run: deno run _perf3.ts <variant>
function makeEager() {
	let seen: Map<object, any>;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any;
		if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), d)); }
		else if (x.constructor === Object || Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => { seen = new Map(); return walk(input, 0); };
}
function makeLazy() {
	let seen: Map<object, any>;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return typeof ref == 'number' ? '~' + ref : ref;
		seen.set(x, ++d);
		let out: string, i = 0, k: any;
		if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), d)); }
		else if (x.constructor === Object || Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => { seen = new Map(); return walk(input, 0); };
}
const variants: Record<string, () => (i: any) => string> = { eager: makeEager, lazy: makeLazy };
function payload() {
	return { users: [ { id: 1, name: 'alice', roles: ['admin', 'user'], active: true, profile: { age: 30, city: 'NYC' } }, { id: 2, name: 'bob', roles: ['user'], active: false, profile: { age: 25, city: 'LA' } }, { id: 3, name: 'carol', roles: ['user', 'mod'], active: true, profile: { age: 28, city: 'SF' } } ], meta: { total: 3, page: 1, perPage: 10, sort: { field: 'name', dir: 'asc' } }, flags: { beta: true, v2: false } };
}
const name = Deno.args[0] ?? 'eager';
const id = variants[name]();
const N = 1_000_000, RUNS = 6;
for (let i = 0; i < 50_000; i++) id(payload());
const times: number[] = [];
for (let r = 0; r < RUNS; r++) { const t0 = performance.now(); for (let i = 0; i < N; i++) id(payload()); times.push(performance.now() - t0); }
times.sort((a, b) => a - b);
console.log(`${name.padEnd(8)} best=${times[0].toFixed(1)}ms median=${times[Math.floor(RUNS / 2)].toFixed(1)}ms  (per-op: ${(times[0] / N * 1000).toFixed(1)}ns)`);
