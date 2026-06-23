// Dispatch-ordering perf. Run: deno run _perf2.ts <variant>. Deleted after use.

// current "final": seen.get first, Array, Date, RegExp, Set, Map, ctor||toString
function makeFinal() {
	let seen: Map<object, string>;
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

// earlyDR: Date/RegExp early-return before seen
function makeEarlyDR() {
	let seen: Map<object, string>;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		if (x instanceof Date) return 'd' + +x;
		if (x instanceof RegExp) return 'r' + x.source + x.flags;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any;
		if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], d)); }
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), d)); }
		else if (x.constructor === Object || Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => { seen = new Map(); return walk(input, 0); };
}

// objFirst: constructor===Object fast-path first (duplicated obj walk in fallback)
function makeObjFirst() {
	let seen: Map<object, string>;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), d)); }
		else if (Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => { seen = new Map(); return walk(input, 0); };
}

const variants: Record<string, () => (i: any) => string> = { final: makeFinal, earlyDR: makeEarlyDR, objFirst: makeObjFirst };

// object/array heavy json-like payload (the stated use case)
function payload() {
	return {
		users: [
			{ id: 1, name: 'alice', roles: ['admin', 'user'], active: true, profile: { age: 30, city: 'NYC' } },
			{ id: 2, name: 'bob', roles: ['user'], active: false, profile: { age: 25, city: 'LA' } },
			{ id: 3, name: 'carol', roles: ['user', 'mod'], active: true, profile: { age: 28, city: 'SF' } },
		],
		meta: { total: 3, page: 1, perPage: 10, sort: { field: 'name', dir: 'asc' } },
		flags: { beta: true, v2: false },
	};
}

const name = Deno.args[0] ?? 'final';
const id = variants[name]();
const N = 1_000_000, RUNS = 6;
for (let i = 0; i < 50_000; i++) id(payload());
const times: number[] = [];
for (let r = 0; r < RUNS; r++) { const t0 = performance.now(); for (let i = 0; i < N; i++) id(payload()); times.push(performance.now() - t0); }
times.sort((a, b) => a - b);
console.log(`${name.padEnd(10)} best=${times[0].toFixed(1)}ms median=${times[Math.floor(RUNS / 2)].toFixed(1)}ms  (per-op: ${(times[0] / N * 1000).toFixed(1)}ns)`);

// appended variant test is in _perf3
