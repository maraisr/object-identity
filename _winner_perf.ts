// Scratch timing loop for final candidates. Delete after use.

function current(input: any, seen: Map<object, string>, depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	let ref = seen.get(input);
	if (ref) return ref;
	seen.set(input, '~' + ++depth);
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += current(input[i++], seen, depth));
	} else if (input instanceof Date) out = 'd' + +input;
	else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
	else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += current(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		for (
			keys = [...input.keys()].sort();
			i < keys.length;
			out += keys[i] + current(input.get(keys[i++]), seen, depth)
		);
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		for (
			keys = Object.keys(input).sort();
			i < keys.length;
			out += keys[i] + current(input[keys[i++]], seen, depth)
		);
	} else throw new Error(`Unsupported value ${input}`);
	seen.set(input, out);
	return out;
}

function pair(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	let ref = seen.indexOf(input);
	if (ref > -1) return seen[ref + 1];
	ref = seen.push(input, '~' + ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pair(input[i++], seen, depth));
	} else if (input instanceof Date) out = 'd' + +input;
	else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
	else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pair(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		for (
			keys = [...input.keys()].sort();
			i < keys.length;
			out += keys[i] + pair(input.get(keys[i++]), seen, depth)
		);
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		for (
			keys = Object.keys(input).sort();
			i < keys.length;
			out += keys[i] + pair(input[keys[i++]], seen, depth)
		);
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairSkip(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	let ref = seen.indexOf(input);
	if (ref > -1) return seen[ref + 1];
	ref = seen.push(input, '~' + ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairSkip(input[i++], seen, depth));
	} else if (input instanceof Date) out = 'd' + +input;
	else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
	else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairSkip(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairSkip(input.get(keys[i++]), seen, depth));
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairSkip(input[keys[i++]], seen, depth));
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarly(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref = seen.indexOf(input);
	if (ref > -1) return seen[ref + 1];
	ref = seen.push(input, '~' + ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairEarly(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairEarly(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairEarly(input.get(keys[i++]), seen, depth));
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairEarly(input[keys[i++]], seen, depth));
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlyNoSkip(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref = seen.indexOf(input);
	if (ref > -1) return seen[ref + 1];
	ref = seen.push(input, '~' + ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairEarlyNoSkip(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairEarlyNoSkip(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		for (
			keys = [...input.keys()].sort();
			i < keys.length;
			out += keys[i] + pairEarlyNoSkip(input.get(keys[i++]), seen, depth)
		);
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		for (
			keys = Object.keys(input).sort();
			i < keys.length;
			out += keys[i] + pairEarlyNoSkip(input[keys[i++]], seen, depth)
		);
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlySmallMap(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref = seen.indexOf(input);
	if (ref > -1) return seen[ref + 1];
	ref = seen.push(input, '~' + ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairEarlySmallMap(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairEarlySmallMap(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + pairEarlySmallMap(input.get(keys[i++]), seen, depth)
			);
		} else {
			for (keys of input) out += keys[0] + pairEarlySmallMap(keys[1], seen, depth);
		}
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairEarlySmallMap(input[keys[i++]], seen, depth));
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlySmallMapLazy(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref = seen.indexOf(input);
	if (ref > -1) return (ref = seen[ref + 1]) > 0 ? '~' + ref : ref;
	ref = seen.push(input, ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairEarlySmallMapLazy(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairEarlySmallMapLazy(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + pairEarlySmallMapLazy(input.get(keys[i++]), seen, depth)
			);
		} else {
			for (keys of input) out += keys[0] + pairEarlySmallMapLazy(keys[1], seen, depth);
		}
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (
			;
			i < keys.length;
			out += keys[i] + pairEarlySmallMapLazy(input[keys[i++]], seen, depth)
		);
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlySmallMapLazyTweak(input: any, seen: any[], depth: number): string {
	if (input == null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref = seen.indexOf(input);
	if (~ref) return (ref = seen[ref + 1]) > 0 ? '~' + ref : ref;
	ref = seen.push(input, ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairEarlySmallMapLazyTweak(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (keys of input) out += pairEarlySmallMapLazyTweak(keys, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + pairEarlySmallMapLazyTweak(input.get(keys[i++]), seen, depth)
			);
		} else {
			for (keys of input) out += keys[0] + pairEarlySmallMapLazyTweak(keys[1], seen, depth);
		}
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (
			;
			i < keys.length;
			out += keys[i] + pairEarlySmallMapLazyTweak(input[keys[i++]], seen, depth)
		);
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlySmallMapLazyArray2(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref = seen.indexOf(input);
	if (ref > -1) return (ref = seen[ref + 1]) > 0 ? '~' + ref : ref;
	ref = seen.push(input, ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = input.length === 2
			? 'a' +
				pairEarlySmallMapLazyArray2(input[0], seen, depth) +
				pairEarlySmallMapLazyArray2(input[1], seen, depth)
			: 'a';
		for (; i < input.length && input.length !== 2; out += pairEarlySmallMapLazyArray2(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairEarlySmallMapLazyArray2(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + pairEarlySmallMapLazyArray2(input.get(keys[i++]), seen, depth)
			);
		} else {
			for (keys of input) out += keys[0] + pairEarlySmallMapLazyArray2(keys[1], seen, depth);
		}
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (
			;
			i < keys.length;
			out += keys[i] + pairEarlySmallMapLazyArray2(input[keys[i++]], seen, depth)
		);
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlySmallMapLazyUnified(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref: any = seen.indexOf(input);
	if (ref > -1) return (ref = seen[ref + 1]) > 0 ? '~' + ref : ref;
	ref = seen.push(input, ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input) || input instanceof Set) {
		out = 'a';
		for (keys of input) out += pairEarlySmallMapLazyUnified(keys, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + pairEarlySmallMapLazyUnified(input.get(keys[i++]), seen, depth)
			);
		} else {
			for (keys of input) out += keys[0] + pairEarlySmallMapLazyUnified(keys[1], seen, depth);
		}
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (
			;
			i < keys.length;
			out += keys[i] + pairEarlySmallMapLazyUnified(input[keys[i++]], seen, depth)
		);
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlySmallMapLazyObject1(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref: any = seen.indexOf(input);
	if (ref > -1) return (ref = seen[ref + 1]) > 0 ? '~' + ref : ref;
	ref = seen.push(input, ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairEarlySmallMapLazyObject1(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairEarlySmallMapLazyObject1(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + pairEarlySmallMapLazyObject1(input.get(keys[i++]), seen, depth)
			);
		} else {
			for (keys of input) out += keys[0] + pairEarlySmallMapLazyObject1(keys[1], seen, depth);
		}
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length === 1) {
			out += keys[0] + pairEarlySmallMapLazyObject1(input[keys[0]], seen, depth);
		} else {
			if (keys.length > 1) keys.sort();
			for (
				;
				i < keys.length;
				out += keys[i] + pairEarlySmallMapLazyObject1(input[keys[i++]], seen, depth)
			);
		}
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairObjFirst(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	let ref = seen.indexOf(input);
	if (ref > -1) return seen[ref + 1];
	ref = seen.push(input, '~' + ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairObjFirst(input[keys[i++]], seen, depth));
	} else if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairObjFirst(input[i++], seen, depth));
	} else if (input instanceof Date) out = 'd' + +input;
	else if (input instanceof RegExp) out = 'r' + input.source + input.flags;
	else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairObjFirst(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairObjFirst(input.get(keys[i++]), seen, depth));
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

function pairEarlyObjFirst(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;
	let ref = seen.indexOf(input);
	if (ref > -1) return seen[ref + 1];
	ref = seen.push(input, '~' + ++depth) - 1;
	let out: string, i = 0, keys: any;
	if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairEarlyObjFirst(input[keys[i++]], seen, depth));
	} else if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += pairEarlyObjFirst(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += pairEarlyObjFirst(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + pairEarlyObjFirst(input.get(keys[i++]), seen, depth));
	} else throw new Error(`Unsupported value ${input}`);
	seen[ref] = out;
	return out;
}

const fixed = new Date(1700000000000);
function getObject() {
	const c: any = [1];
	c.push(c);
	return { a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] }, d: fixed, r: /a/ };
}

const variants: Record<string, (input: any) => string> = {
	current: (input) => current(input, new Map(), 0),
	pair: (input) => pair(input, [], 0),
	pairSkip: (input) => pairSkip(input, [], 0),
	pairEarly: (input) => pairEarly(input, [], 0),
	pairEarlyNoSkip: (input) => pairEarlyNoSkip(input, [], 0),
	pairEarlySmallMap: (input) => pairEarlySmallMap(input, [], 0),
	pairEarlySmallMapLazy: (input) => pairEarlySmallMapLazy(input, [], 0),
	pairEarlySmallMapLazyTweak: (input) => pairEarlySmallMapLazyTweak(input, [], 0),
	pairEarlySmallMapLazyArray2: (input) => pairEarlySmallMapLazyArray2(input, [], 0),
	pairEarlySmallMapLazyUnified: (input) => pairEarlySmallMapLazyUnified(input, [], 0),
	pairEarlySmallMapLazyObject1: (input) => pairEarlySmallMapLazyObject1(input, [], 0),
	pairObjFirst: (input) => pairObjFirst(input, [], 0),
	pairEarlyObjFirst: (input) => pairEarlyObjFirst(input, [], 0),
};

const want = variants.current(getObject());
for (const name in variants) {
	const got = variants[name](getObject());
	if (got !== want) throw new Error(`${name}: ${got} !== ${want}`);
}

function run(name: string) {
	const fn = variants[name];
	const n = 2_000_000;
	for (let i = 0; i < 100_000; i++) fn(getObject());
	const times = [];
	for (let r = 0; r < 8; r++) {
		const t = performance.now();
		for (let i = 0; i < n; i++) fn(getObject());
		times.push(performance.now() - t);
	}
	times.sort((a, b) => a - b);
	console.log(`${name.padEnd(9)} best=${times[0].toFixed(1)}ms median=${times[4].toFixed(1)}ms`);
}

for (const name of Object.keys(variants)) run(name);
