// Scratch benchmark for seen-table variants. Delete after use.

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
		} else if (input instanceof Date) {
			out = 'd' + +input;
		} else if (input instanceof RegExp) {
			out = 'r' + input.source + input.flags;
		} else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + walk(input.get(keys[i++]), seen, depth)
			);
		} else if (
			input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
		) {
			out = 'o';
			for (
				keys = Object.keys(input).sort();
				i < keys.length;
				out += keys[i] + walk(input[keys[i++]], seen, depth)
			);
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}

function makePairIndexOf() {
	function walk(input: any, seen: any[], depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.indexOf(input);
		if (ref > -1) return seen[ref + 1];
		ref = seen.push(input, '~' + ++depth) - 1;
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, depth));
		} else if (input instanceof Date) {
			out = 'd' + +input;
		} else if (input instanceof RegExp) {
			out = 'r' + input.source + input.flags;
		} else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + walk(input.get(keys[i++]), seen, depth)
			);
		} else if (
			input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
		) {
			out = 'o';
			for (
				keys = Object.keys(input).sort();
				i < keys.length;
				out += keys[i] + walk(input[keys[i++]], seen, depth)
			);
		} else throw new Error(`Unsupported value ${input}`);
		seen[ref] = out;
		return out;
	}
	return (input: any) => walk(input, [], 0);
}

function makeTwoIndexOf() {
	function walk(input: any, seen: object[], values: string[], depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.indexOf(input);
		if (ref > -1) return values[ref];
		ref = seen.push(input) - 1;
		values[ref] = '~' + ++depth;
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, values, depth));
		} else if (input instanceof Date) {
			out = 'd' + +input;
		} else if (input instanceof RegExp) {
			out = 'r' + input.source + input.flags;
		} else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, values, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + walk(input.get(keys[i++]), seen, values, depth)
			);
		} else if (
			input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
		) {
			out = 'o';
			for (
				keys = Object.keys(input).sort();
				i < keys.length;
				out += keys[i] + walk(input[keys[i++]], seen, values, depth)
			);
		} else throw new Error(`Unsupported value ${input}`);
		values[ref] = out;
		return out;
	}
	return (input: any) => walk(input, [], [], 0);
}

function makePairManual() {
	function walk(input: any, seen: any[], depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.length;
		for (; ref--;) if (seen[ref] === input) return seen[ref + 1];
		ref = seen.push(input, '~' + ++depth) - 1;
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, depth));
		} else if (input instanceof Date) {
			out = 'd' + +input;
		} else if (input instanceof RegExp) {
			out = 'r' + input.source + input.flags;
		} else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + walk(input.get(keys[i++]), seen, depth)
			);
		} else if (
			input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
		) {
			out = 'o';
			for (
				keys = Object.keys(input).sort();
				i < keys.length;
				out += keys[i] + walk(input[keys[i++]], seen, depth)
			);
		} else throw new Error(`Unsupported value ${input}`);
		seen[ref] = out;
		return out;
	}
	return (input: any) => walk(input, [], 0);
}

function makePairIndexSkipSort() {
	function walk(input: any, seen: any[], depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.indexOf(input);
		if (ref > -1) return seen[ref + 1];
		ref = seen.push(input, '~' + ++depth) - 1;
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, depth));
		} else if (input instanceof Date) {
			out = 'd' + +input;
		} else if (input instanceof RegExp) {
			out = 'r' + input.source + input.flags;
		} else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			keys = [...input.keys()];
			if (keys.length > 1) keys.sort();
			for (; i < keys.length; out += keys[i] + walk(input.get(keys[i++]), seen, depth));
		} else if (
			input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
		) {
			out = 'o';
			keys = Object.keys(input);
			if (keys.length > 1) keys.sort();
			for (; i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen[ref] = out;
		return out;
	}
	return (input: any) => walk(input, [], 0);
}

function makeMapLazySkipSort() {
	function walk(input: any, seen: Map<object, any>, depth: number): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let ref = seen.get(input);
		if (ref) return ref > 0 ? '~' + ref : ref;
		seen.set(input, ++depth);
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++], seen, depth));
		} else if (input instanceof Date) {
			out = 'd' + +input;
		} else if (input instanceof RegExp) {
			out = 'r' + input.source + input.flags;
		} else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value, seen, depth);
		} else if (input instanceof Map) {
			out = 'o';
			keys = [...input.keys()];
			if (keys.length > 1) keys.sort();
			for (; i < keys.length; out += keys[i] + walk(input.get(keys[i++]), seen, depth));
		} else if (
			input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
		) {
			out = 'o';
			keys = Object.keys(input);
			if (keys.length > 1) keys.sort();
			for (; i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		} else throw new Error(`Unsupported value ${input}`);
		seen.set(input, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}

const variants: Record<string, () => (input: any) => string> = {
	current: makeCurrent,
	pairIndexOf: makePairIndexOf,
	twoIndexOf: makeTwoIndexOf,
	pairManual: makePairManual,
	pairIndexSkipSort: makePairIndexSkipSort,
	mapLazySkipSort: makeMapLazySkipSort,
};

const fixed = new Date(1700000000000);

function benchObject() {
	const c: any = [1];
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] }, d: fixed, r: /a/ };
}

function realistic() {
	return {
		id: 12345,
		name: 'a product name',
		price: 19.99,
		tags: ['a', 'b', 'c', 'd'],
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

const current = makeCurrent();
for (const [label, payload] of [
	['benchObject', benchObject],
	['realistic', realistic],
	['jsonPayload', jsonPayload],
] as const) {
	for (const name in variants) {
		const got = variants[name]()(payload());
		const want = current(payload());
		if (got !== want) console.error(`MISMATCH ${name}/${label}: ${got} !== ${want}`);
	}
}

for (const [group, payload] of [
	['benchObject', benchObject],
	['realistic', realistic],
	['jsonPayload', jsonPayload],
] as const) {
	for (const name in variants) {
		const fn = variants[name]();
		Deno.bench({ name, group, baseline: name === 'current', fn() { fn(payload()); } });
	}
}
