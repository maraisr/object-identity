// Fuzz: compare orig vs new on random structures. Deleted after use.
import { identify as neu } from './lib/mod.ts';

// inline original
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
const orig = (input: any) => { seen = new WeakMap(); return walk(input, 0); };

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
for (let t = 0; t < 200000; t++) {
	const v = gen(0);
	let a, b;
	try { a = orig(v); } catch (e) { a = 'ERR:' + (e as Error).message; }
	try { b = neu(v); } catch (e) { b = 'ERR:' + (e as Error).message; }
	if (a !== b) { mismatches++; if (mismatches <= 10) console.error(`MISMATCH:\n  orig=${a}\n  neu =${b}\n  val =${Deno.inspect(v, { depth: 6 })}`); }
}
console.log(mismatches === 0 ? 'FUZZ PASS: all 200000 identical' : `FUZZ FAIL: ${mismatches} mismatches`);

// Circular cases
function circ() {
	const results: boolean[] = [];
	{ const o: any = { a: 1 }; o.self = o; results.push(orig(o) === neu(o)); }
	{ const a: any = [1, 2]; a.push(a); results.push(orig(a) === neu(a)); }
	{ const s2: any = new Set([1]); s2.add(s2); results.push(orig(s2) === neu(s2)); }
	{ const m: any = new Map([['a', 1]]); m.set('self', m); results.push(orig(m) === neu(m)); }
	{ const o: any = { b: { c: 123 } }; o.b.d = o; o.x = [9, o.b]; results.push(orig(o) === neu(o)); }
	return results.every(Boolean);
}
console.log(circ() ? 'CIRCULAR PASS' : 'CIRCULAR FAIL');
