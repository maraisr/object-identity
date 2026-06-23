function walk(input: any, seen: any[], depth: number): string {
	if (input === null || typeof input !== 'object') return '' + input;

	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;

	let ref: any = seen.indexOf(input);
	if (ref > -1) return (ref = seen[ref + 1]) > 0 ? '~' + ref : ref;
	ref = seen.push(input, ++depth) - 1;

	let out: string;
	let i = 0;
	let keys: any;

	if (Array.isArray(input)) {
		out = 'a';
		for (; i < input.length; out += walk(input[i++], seen, depth));
	} else if (input instanceof Set) {
		out = 'a';
		for (let value of input) out += walk(value, seen, depth);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (
				keys = [...input.keys()].sort();
				i < keys.length;
				out += keys[i] + walk(input.get(keys[i++]), seen, depth)
			);
		} else {
			for (keys of input) out += keys[0] + walk(keys[1], seen, depth);
		}
	} else if (
		input.constructor === Object || Object.prototype.toString.call(input) === '[object Object]'
	) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
	} else {
		throw new Error(`Unsupported value ${input}`);
	}

	seen[ref] = out;
	return out;
}

/**
 * Creates a shape equivalent identifier for an input object.
 * This is useful for comparing objects, where keys could be provided in any order.
 *
 * @example
 * ```ts
 * const obj = { a: 1, b: 2 };
 * const obj2 = { b: 2, a: 1 };
 *
 * console.log(identify(obj) === identify(obj2)); // true
 * ```
 */
export function identify<T>(input: T): string {
	return walk(input, [], 0);
}
