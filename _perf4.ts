// Threaded variants on the real bench payload. Run: deno run _perf4.ts <variant>
function makeCurrent() {
	function walk(x: any, seen: Map<object, string>, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any;
		if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], seen, d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, seen, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), seen, d)); }
		else if (x.constructor === Object || Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}
function makeEarlyDR() {
	function walk(x: any, seen: Map<object, string>, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		if (x instanceof Date) return 'd' + +x;
		if (x instanceof RegExp) return 'r' + x.source + x.flags;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any;
		if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], seen, d)); }
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, seen, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), seen, d)); }
		else if (x.constructor === Object || Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}
function makeObjArrFirst() {
	function walk(x: any, seen: Map<object, string>, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		else if (Array.isArray(x)) { out = 'a'; for (; i < x.length; out += walk(x[i++], seen, d)); }
		else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) { out = 'a'; for (let v of x) out += walk(v, seen, d); }
		else if (x instanceof Map) { out = 'o'; for (k = [...x.keys()].sort(); i < k.length; out += k[i] + walk(x.get(k[i++]), seen, d)); }
		else if (Object.prototype.toString.call(x) === '[object Object]') { out = 'o'; for (k = Object.keys(x).sort(); i < k.length; out += k[i] + walk(x[k[i++]], seen, d)); }
		else throw new Error('Unsupported value ' + x);
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}
const variants: Record<string, () => (i: any) => string> = { current: makeCurrent, earlyDR: makeEarlyDR, objArrFirst: makeObjArrFirst };
function getObject() {
	const c: any = [1];
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] }, d: new Date(1700000000000), r: /a/ };
}
const name = Deno.args[0] ?? 'current';
const id = variants[name]();
// correctness vs current
if (name !== 'current') {
	const cur = makeCurrent();
	if (id(getObject()) !== cur(getObject())) console.error('MISMATCH for ' + name);
}
const N = 2_000_000, RUNS = 6;
for (let i = 0; i < 50_000; i++) id(getObject());
const times: number[] = [];
for (let r = 0; r < RUNS; r++) { const t0 = performance.now(); for (let i = 0; i < N; i++) id(getObject()); times.push(performance.now() - t0); }
times.sort((a, b) => a - b);
console.log(`${name.padEnd(12)} best=${times[0].toFixed(1)}ms  (per-op: ${(times[0] / N * 1000).toFixed(1)}ns)`);
