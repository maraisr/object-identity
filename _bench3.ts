// Two-phase vs current bench. Run: deno bench --no-check _bench3.ts. Deleted after use.

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

function makeTwoPhase() {
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
			for (keys = [...input.keys()].sort(); i < keys.length; out += keys[i] + slow(input.get(keys[i++]), seen, depth));
		} else if (input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]') {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + slow(input[keys[i++]], seen, depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => {
		try { return fast(input, 0); }
		catch (e) { if (e !== CYCLE) throw e; return slow(input, new Map(), 0); }
	};
}

const variants: Record<string, () => (i: any) => string> = {
	current: makeCurrent,
	twoPhase: makeTwoPhase,
};

const FIXED = new Date(1700000000000);
function benchObject() {
	const c: any = [1]; c.push(c);
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

const groups: Record<string, () => any> = { benchObject, realistic, jsonPayload };
for (const g in groups) {
	for (const name in variants) {
		const fn = variants[name]();
		Deno.bench({ name, group: g, baseline: name === 'current', fn() { fn(groups[g]()); } });
	}
}
