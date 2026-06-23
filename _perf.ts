// Clean perf harness. Run: deno run _perf.ts <variant>. Deleted after use.

function makeOrig() {
	let seen = new WeakMap<object, string>();
	function walk(input: any, ref_index: number): string {
		if (input == null || typeof input !== 'object') return String(input);
		let tmp: any, out = '', i = 0;
		let type = Object.prototype.toString.call(input);
		if (!(type === '[object RegExp]' || type === '[object Date]') && seen.has(input)) return seen.get(input)!;
		seen.set(input, '~' + ++ref_index);
		switch (type) {
			case '[object Set]': tmp = Array.from(input as Set<unknown>);
			case '[object Array]': { tmp ||= input; out += 'a'; for (; i < tmp.length; out += walk(tmp[i++], ref_index)); } break;
			case '[object Object]': { out += 'o'; tmp = Object.keys(input).sort(); for (; i < tmp.length; out += tmp[i] + walk(input[tmp[i++]], ref_index)); } break;
			case '[object Map]': { out += 'o'; tmp = Array.from((input as Map<string, unknown>).keys()).sort(); for (; i < tmp.length; out += tmp[i] + walk(input.get(tmp[i++]), ref_index)); } break;
			case '[object Date]': return 'd' + +input;
			case '[object RegExp]': return 'r' + (input as RegExp).source + (input as RegExp).flags;
			default: throw new Error(`Unsupported value ${input}`);
		}
		seen.set(input, out);
		return out;
	}
	return (input: any) => walk(input, 0);
}

// instanceof dispatch + per-call WeakMap
function makeInstPerCallWeak() {
	function walk(x: any, seen: WeakMap<object, string>, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) { out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		else if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], seen, d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, seen, d); }
		else if (x instanceof Map) { out = 'o'; k = [...x.keys()].sort(); for (; i < k.length; out += k[i] + walk(x.get(k[i++]), seen, d)); }
		else { if (Object.prototype.toString.call(x) !== '[object Object]') throw new Error('Unsupported value ' + x); out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, new WeakMap(), 0);
}

// instanceof dispatch + per-call Map
function makeInstPerCallMap() {
	function walk(x: any, seen: Map<object, string>, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) { out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		else if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], seen, d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, seen, d); }
		else if (x instanceof Map) { out = 'o'; k = [...x.keys()].sort(); for (; i < k.length; out += k[i] + walk(x.get(k[i++]), seen, d)); }
		else { if (Object.prototype.toString.call(x) !== '[object Object]') throw new Error('Unsupported value ' + x); out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}

// instanceof dispatch + global WeakMap (like orig structure but new dispatch)
function makeInstGlobalWeak() {
	let seen = new WeakMap<object, string>();
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) { out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, d); }
		else if (x instanceof Map) { out = 'o'; k = [...x.keys()].sort(); for (; i < k.length; out += k[i] + walk(x.get(k[i++]), d)); }
		else { if (Object.prototype.toString.call(x) !== '[object Object]') throw new Error('Unsupported value ' + x); out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, 0);
}

// module-level Map reassigned per top-level call; walk uses closure (no threaded param)
function makeInstModuleMap() {
	let seen: Map<object, string>;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) { out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, d); }
		else if (x instanceof Map) { out = 'o'; k = [...x.keys()].sort(); for (; i < k.length; out += k[i] + walk(x.get(k[i++]), d)); }
		else { if (Object.prototype.toString.call(x) !== '[object Object]') throw new Error('Unsupported value ' + x); out = 'o'; k = Object.keys(x).sort(); for (; i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		seen.set(x, out);
		return out;
	}
	return (input: any) => { seen = new Map(); return walk(input, 0); };
}

// Final shape: module Map, instanceof dispatch, single object-walk with preserved throw
function makeFinal() {
	let seen: Map<object, string>;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), d)); }
		else if (c === Object || Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => { seen = new Map(); return walk(input, 0); };
}

const variants: Record<string, () => (i: any) => string> = {
	orig: makeOrig,
	instPerCallWeak: makeInstPerCallWeak,
	instPerCallMap: makeInstPerCallMap,
	instGlobalWeak: makeInstGlobalWeak,
	instModuleMap: makeInstModuleMap,
	final: makeFinal,
};

const FIXED = new Date(1700000000000);
function getObject() {
	const c: any = [1];
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] }, d: FIXED, r: /a/ };
}
function realistic() {
	return { id: 12345, name: 'a product name', price: 19.99, tags: ['a', 'b', 'c', 'd'], meta: { created: '2024-01-01', updated: '2024-06-01', active: true, count: 42 }, nested: { a: { b: { c: { d: 1 } } } } };
}

const name = Deno.args[0] ?? 'orig';
const id = variants[name]();

const N = 500_000;
const RUNS = 6;
// warmup
for (let i = 0; i < 50_000; i++) { id(getObject()); id(realistic()); }

const times: number[] = [];
for (let r = 0; r < RUNS; r++) {
	const t0 = performance.now();
	for (let i = 0; i < N; i++) { id(getObject()); id(realistic()); }
	times.push(performance.now() - t0);
}
times.sort((a, b) => a - b);
const median = times[Math.floor(RUNS / 2)];
const best = times[0];
console.log(`${name.padEnd(18)} best=${best.toFixed(1)}ms median=${median.toFixed(1)}ms  (per-op: ${(best / (N * 2) * 1000).toFixed(1)}ns)`);
