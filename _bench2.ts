// Isolate cost centers. Run: deno bench --no-check _bench2.ts. Deleted after use.

// baseline = current
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

// NO SORT (incorrect output, measures sort cost)
function makeNoSort() {
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
			for (keys = [...input.keys()]; i < keys.length; out += keys[i] + walk(input.get(keys[i++]), seen, depth));
		} else {
			out = 'o';
			for (keys = Object.keys(input); i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		}
		seen.set(input, out);
		return out;
	}
	return (input: any) => walk(input, new Map(), 0);
}

// NO MAP (incorrect for cycles, measures map cost) — only for acyclic payloads
function makeNoMap() {
	function walk(input: any): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++]));
		} else if (input instanceof Date) out = 'd' + +input;
		else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
		else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value);
		} else if (input instanceof Map) {
			out = 'o';
			for (keys = [...input.keys()].sort(); i < keys.length; out += keys[i] + walk(input.get(keys[i++])));
		} else {
			out = 'o';
			for (keys = Object.keys(input).sort(); i < keys.length; out += keys[i] + walk(input[keys[i++]]));
		}
		return out;
	}
	return (input: any) => walk(input);
}

// NO MAP + NO SORT
function makeNoMapNoSort() {
	function walk(input: any): string {
		if (input === null || typeof input !== 'object') return '' + input;
		let out: string, i = 0, keys: any;
		if (Array.isArray(input)) {
			out = 'a';
			for (; i < input.length; out += walk(input[i++]));
		} else if (input instanceof Date) out = 'd' + +input;
		else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
		else if (input instanceof Set) {
			out = 'a';
			for (let value of input) out += walk(value);
		} else if (input instanceof Map) {
			out = 'o';
			for (keys = [...input.keys()]; i < keys.length; out += keys[i] + walk(input.get(keys[i++])));
		} else {
			out = 'o';
			for (keys = Object.keys(input); i < keys.length; out += keys[i] + walk(input[keys[i++]]));
		}
		return out;
	}
	return (input: any) => walk(input);
}

const variants: Record<string, () => (i: any) => string> = {
	current: makeCurrent,
	noSort: makeNoSort,
	noMap: makeNoMap,
	noMapNoSort: makeNoMapNoSort,
};

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

for (const name in variants) {
	const fn = variants[name]();
	Deno.bench({ name, group: 'realistic', baseline: name === 'current', fn() { fn(realistic()); } });
}
for (const name in variants) {
	const fn = variants[name]();
	Deno.bench({ name, group: 'jsonPayload', baseline: name === 'current', fn() { fn(jsonPayload()); } });
}
