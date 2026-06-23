// Consolidated optimization harness. Run: deno bench --no-check _bench.ts
// Deleted after use.

// ---------- current (matches lib/mod.ts) ----------
function makeCurrent() {
	function walk(input: any, seen: Map<object, string>, depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.get(input);
		if (ref) return ref;
		seen.set(input, '~' + ++depth);
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, depth));
		} else if (input instanceof Date) out = 'd' + +input;
		else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
		else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (keys = [...input.keys()].sort(); i < keys.length; out += keys[i] + walk(input.get(keys[i++]), seen, depth));
		} else if (input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]') {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}

// ---------- lazyNum: numeric placeholder, build '~'+n only on hit ----------
function makeLazyNum() {
	function walk(input: any, seen: Map<object, any>, depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.get(input);
		if (ref !== undefined) return typeof ref === 'number' ? '~' + ref : ref;
		seen.set(input, ++depth);
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, depth));
		} else if (input instanceof Date) out = 'd' + +input;
		else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
		else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (keys = [...input.keys()].sort(); i < keys.length; out += keys[i] + walk(input.get(keys[i++]), seen, depth));
		} else if (input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]') {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}

// ---------- reuseClear: module Map reused, clear() at top ----------
function makeReuseClear() {
	let seen = new Map<object, string>();
	function walk(input: any, depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.get(input);
		if (ref) return ref;
		seen.set(input, '~' + ++depth);
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], depth));
		} else if (input instanceof Date) out = 'd' + +input;
		else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
		else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (keys = [...input.keys()].sort(); i < keys.length; out += keys[i] + walk(input.get(keys[i++]), depth));
		} else if (input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]') {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + walk(input[keys[i++]], depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => { seen.clear(); return walk(input, 0); };
}

// ---------- reuseClearLazy: reuse + clear + numeric placeholder ----------
function makeReuseClearLazy() {
	let seen = new Map<object, any>();
	function walk(input: any, depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.get(input);
		if (ref !== undefined) return typeof ref === 'number' ? '~' + ref : ref;
		seen.set(input, ++depth);
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], depth));
		} else if (input instanceof Date) out = 'd' + +input;
		else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
		else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (keys = [...input.keys()].sort(); i < keys.length; out += keys[i] + walk(input.get(keys[i++]), depth));
		} else if (input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]') {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + walk(input[keys[i++]], depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => { seen.clear(); return walk(input, 0); };
}

// ---------- ctorObjFirst: constructor dispatch, Object & Array first ----------
function makeCtorObjFirst() {
	function walk(input: any, seen: Map<object, string>, depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.get(input);
		if (ref) return ref;
		seen.set(input, '~' + ++depth);
		let out: string, i = 0, keys: any, c = input.constructor;
		if (c === Object) {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		} else if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, depth));
		} else if (input instanceof Date) out = 'd' + +input;
		else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
		else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (keys = [...input.keys()].sort(); i < keys.length; out += keys[i] + walk(input.get(keys[i++]), seen, depth));
		} else if (Object.prototype.toString.call(input) === '[object Object]') {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}

const variants: Record<string, () => (i: any) => string> = {
	current: makeCurrent,
	lazyNum: makeLazyNum,
	reuseClear: makeReuseClear,
	reuseClearLazy: makeReuseClearLazy,
	ctorObjFirst: makeCtorObjFirst,
};

// ---------- payloads ----------
const FIXED = new Date(1700000000000);
function benchObject() {
	const c: any = [1];
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] }, d: FIXED, r: /a/ };
}
function realistic() {
	return {
		id: 12345, name: 'a product name', price: 19.99, tags: ['a', 'b', 'c', 'd'],
		meta: { created: '2024-01-01', updated: '2024-06-01', active: true, count: 42 },
		nested: { a: { b: { c: { d: 1 } } } },
	};
}
function jsonPayload() {
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

// ---------- correctness check against current ----------
const cur = makeCurrent();
function check() {
	const sharedO: any = { v: 1 };
	const circA: any = [1]; circA.push(circA);
	const circO: any = { a: 'b' }; circO.c = circO;
	const fixtures = [
		[1, 2, 3], { foo: 'bar' }, { one: 'one', two: 'two' },
		new Set([1, 2, 3]), new Map([['a', 'b'], ['c', 'd']]),
		circA, circO, { x: sharedO, y: sharedO },
		benchObject(), realistic(), jsonPayload(),
		new Date(), /test/, 'str', 123, null, true,
	];
	for (const name in variants) {
		if (name === 'current') continue;
		const fn = variants[name]();
		for (const f of fixtures) {
			const a = cur(f), b = fn(f);
			if (a !== b) console.error(`MISMATCH ${name}: ${JSON.stringify(b)} !== ${JSON.stringify(a)}`);
		}
	}
	console.error('correctness check done');
}
check();

for (const name in variants) {
	const fn = variants[name]();
	Deno.bench({ name, group: 'benchObject', baseline: name === 'current', fn() { fn(benchObject()); } });
}
for (const name in variants) {
	const fn = variants[name]();
	Deno.bench({ name, group: 'realistic', baseline: name === 'current', fn() { fn(realistic()); } });
}
for (const name in variants) {
	const fn = variants[name]();
	Deno.bench({ name, group: 'jsonPayload', baseline: name === 'current', fn() { fn(jsonPayload()); } });
}
