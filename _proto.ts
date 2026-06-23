// Two-phase prototype + fuzz vs original. Run: deno run --no-check _proto.ts
// Deleted after use.

// ---------- ORIGINAL (reference, WeakMap) ----------
let _seen = new WeakMap<object, string>();
function origWalk(input: any, ref_index: number): string {
	if (input == null || typeof input !== 'object') return String(input);
	let tmp: any, out = '', i = 0;
	let type = Object.prototype.toString.call(input);
	if (!(type === '[object RegExp]' || type === '[object Date]') && _seen.has(input)) return _seen.get(input)!;
	_seen.set(input, '~' + ++ref_index);
	switch (type) {
		case '[object Set]': tmp = Array.from(input as Set<unknown>);
		case '[object Array]': { tmp ||= input; out += 'a'; for (; i < tmp.length; out += origWalk(tmp[i++], ref_index)); } break;
		case '[object Object]': { out += 'o'; tmp = Object.keys(input).sort(); for (; i < tmp.length; out += tmp[i] + origWalk(input[tmp[i++]], ref_index)); } break;
		case '[object Map]': { out += 'o'; tmp = Array.from((input as Map<string, unknown>).keys()).sort(); for (; i < tmp.length; out += tmp[i] + origWalk(input.get(tmp[i++]), ref_index)); } break;
		case '[object Date]': return 'd' + +input;
		case '[object RegExp]': return 'r' + (input as RegExp).source + (input as RegExp).flags;
		default: throw new Error(`Unsupported value ${input}`);
	}
	_seen.set(input, out);
	return out;
}
const orig = (input: any) => { _seen = new WeakMap(); return origWalk(input, 0); };

// ---------- TWO-PHASE ----------
const CYCLE: unique symbol = Symbol();

function fast(input: any, depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (++depth > 200) throw CYCLE;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += fast(input[i++], depth));
	} else if (input instanceof Date) out = 'd' + +input;
	else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
	else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += fast(value, depth);
	} else if (input instanceof Map) {
		out = 'o';
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + fast(input.get(keys[i++]), depth));
	} else if (input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]') {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + fast(input[keys[i++]], depth));
	} else throw new Error(`Unsupported value ${input}`);
	return out;
}

function slow(input: any, seen: Map<object, string>, depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	let ref = seen.get(input);
	if (ref) return ref;
	seen.set(input, '~' + ++depth);
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += slow(input[i++], seen, depth));
	} else if (input instanceof Date) out = 'd' + +input;
	else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
	else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += slow(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + slow(input.get(keys[i++]), seen, depth));
	} else if (input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]') {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + slow(input[keys[i++]], seen, depth));
	} else throw new Error(`Unsupported value ${input}`);
	seen.set(input, out);
	return out;
}

function identify(input: any): string {
	try {
		return fast(input, 0);
	} catch (e) {
		if (e !== CYCLE) throw e;
		return slow(input, new Map(), 0);
	}
}

// ---------- FUZZ ----------
let s = 123456789;
function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
function pick<T>(a: T[]): T { return a[Math.floor(rnd() * a.length)]; }
function gen(depth: number): any {
	if (depth > 4 || rnd() < 0.35) {
		return pick<any>([1, 0, -5, 3.14, 'a', 'hello', '', true, false, null, undefined, NaN, 1e10, 'x y z', new Date(Math.floor(rnd() * 1e12)), /abc/gi, /x/]);
	}
	const kind = pick(['obj', 'arr', 'set', 'map']);
	const n = Math.floor(rnd() * 4);
	if (kind === 'arr') { const a = []; for (let i = 0; i < n; i++) a.push(gen(depth + 1)); return a; }
	if (kind === 'set') { const st = new Set(); for (let i = 0; i < n; i++) st.add(gen(depth + 1)); return st; }
	if (kind === 'map') { const m = new Map(); for (let i = 0; i < n; i++) m.set(pick(['a', 'b', 'c', 'd', 1, 2, 3]), gen(depth + 1)); return m; }
	const o: any = {}; for (let i = 0; i < n; i++) o[pick(['a', 'b', 'c', 'd', 'foo', 'bar', '1', '2'])] = gen(depth + 1); return o;
}

let mismatches = 0;
for (let t = 0; t < 300000; t++) {
	const v = gen(0);
	let a, b;
	try { a = orig(v); } catch (e) { a = 'ERR:' + (e as Error).message; }
	try { b = identify(v); } catch (e) { b = 'ERR:' + (e as Error).message; }
	if (a !== b) { mismatches++; if (mismatches <= 10) console.error(`MISMATCH:\n  orig=${a}\n  neu =${b}\n  val =${Deno.inspect(v, { depth: 6 })}`); }
}
console.log(mismatches === 0 ? 'FUZZ PASS: all 300000 identical' : `FUZZ FAIL: ${mismatches} mismatches`);

// Circular cases (must hit slow path and match orig)
function circ() {
	const cases: any[] = [];
	{ const o: any = { a: 1 }; o.self = o; cases.push(o); }
	{ const a: any = [1, 2]; a.push(a); cases.push(a); }
	{ const st: any = new Set([1]); st.add(st); cases.push(st); }
	{ const m: any = new Map([['a', 1]]); m.set('self', m); cases.push(m); }
	{ const o: any = { b: { c: 123 } }; o.b.d = o; o.x = [9, o.b]; cases.push(o); }
	{ const o: any = { a: 1, c: 2 }; o.b = o; o.d = new Map(); o.d.set('x', o.d); cases.push(o); }
	{ const sharedO: any = { v: 1 }; cases.push({ x: sharedO, y: sharedO }); }
	{ const c: any = [1]; c.push(c); cases.push({ a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] } }); }
	let ok = true;
	for (const v of cases) {
		const a = orig(v), b = identify(v);
		if (a !== b) { ok = false; console.error(`CIRC MISMATCH:\n  orig=${a}\n  neu =${b}`); }
	}
	return ok;
}
console.log(circ() ? 'CIRCULAR PASS' : 'CIRCULAR FAIL');

// Deep acyclic (exceeds 200 -> falls to slow path, must still match)
{
	let deep: any = {}; const root = deep;
	for (let i = 0; i < 500; i++) { deep.child = {}; deep.val = i; deep = deep.child; }
	const a = orig(root), b = identify(root);
	console.log(a === b ? 'DEEP-ACYCLIC PASS' : 'DEEP-ACYCLIC FAIL');
}
