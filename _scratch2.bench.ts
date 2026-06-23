// Scratch benchmark v2. Deleted after use.

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

// D: constructor dispatch, Object & Array fast-pathed first, toString fallback for default
function makeD() {
	let seen = new WeakMap<object, string>();
	let toStr = Object.prototype.toString;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) {
			out = 'o'; k = Object.keys(x).sort();
			for (; i < k.length; out += k[i] + walk(x[k[i++]], d));
		} else if (Array.isArray(x)) {
			out = 'a';
			for (; i < x.length; out += walk(x[i++], d));
		} else if (c === Date) out = 'd' + +x;
		else if (c === RegExp) out = 'r' + x.source + x.flags;
		else if (c === Set) {
			out = 'a';
			for (let v of x) out += walk(v, d);
		} else if (c === Map) {
			out = 'o'; k = [...x.keys()].sort();
			for (; i < k.length; out += k[i] + walk(x.get(k[i++]), d));
		} else {
			if (toStr.call(x) !== '[object Object]') throw new Error('Unsupported value ' + x);
			out = 'o'; k = Object.keys(x).sort();
			for (; i < k.length; out += k[i] + walk(x[k[i++]], d));
		}
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, 0);
}

// F: like D but instanceof for Date/RegExp/Set/Map (subclass robust)
function makeF() {
	let seen = new WeakMap<object, string>();
	let toStr = Object.prototype.toString;
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any, c = x.constructor;
		if (c === Object) {
			out = 'o'; k = Object.keys(x).sort();
			for (; i < k.length; out += k[i] + walk(x[k[i++]], d));
		} else if (Array.isArray(x)) {
			out = 'a';
			for (; i < x.length; out += walk(x[i++], d));
		} else if (x instanceof Date) out = 'd' + +x;
		else if (x instanceof RegExp) out = 'r' + x.source + x.flags;
		else if (x instanceof Set) {
			out = 'a';
			for (let v of x) out += walk(v, d);
		} else if (x instanceof Map) {
			out = 'o'; k = [...x.keys()].sort();
			for (; i < k.length; out += k[i] + walk(x.get(k[i++]), d));
		} else {
			if (toStr.call(x) !== '[object Object]') throw new Error('Unsupported value ' + x);
			out = 'o'; k = Object.keys(x).sort();
			for (; i < k.length; out += k[i] + walk(x[k[i++]], d));
		}
		seen.set(x, out);
		return out;
	}
	return (input: any) => walk(input, 0);
}

const orig = makeOrig(), D = makeD(), F = makeF();

const FIXED = new Date(1700000000000);
const getObject = () => {
	const c: any = [1];
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] }, d: FIXED, r: /a/ };
};
const realistic = () => ({
	id: 12345, name: 'a product name', price: 19.99, tags: ['a', 'b', 'c', 'd'],
	meta: { created: '2024-01-01', updated: '2024-06-01', active: true, count: 42 },
	nested: { a: { b: { c: { d: 1 } } } },
});
const deepObj = () => {
	let o: any = {}; let cur = o;
	for (let i = 0; i < 8; i++) { cur.k0 = i; cur.k1 = 'v' + i; cur.child = {}; cur = cur.child; }
	return { root: o, list: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
};

for (const [name, fn] of [['D', D], ['F', F]] as const) {
	for (const [g, payload] of [['bench-object', getObject], ['realistic', realistic], ['deep', deepObj]] as const) {
		if (fn(payload()) !== orig(payload())) console.error(`MISMATCH ${name}/${g}`);
		else console.error(`OK ${name}/${g}: ${fn(payload())}`);
	}
}

for (const [g, payload] of [['bench-object', getObject], ['realistic', realistic], ['deep', deepObj]] as const) {
	Deno.bench({ name: 'orig', group: g, baseline: true, fn() { orig(payload()); } });
	Deno.bench({ name: 'D-ctor', group: g, fn() { D(payload()); } });
	Deno.bench({ name: 'F-instanceof', group: g, fn() { F(payload()); } });
}
