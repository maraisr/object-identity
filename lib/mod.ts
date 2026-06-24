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
	} else if (input[Symbol.toStringTag] === undefined) {
		// Plain objects, class instances and null-prototype objects have no
		// `Symbol.toStringTag`; exotic builtins (Promise, typed arrays, WeakMap,
		// ArrayBuffer, …) do, so this both selects key-walkable objects and
		// rejects the unsupported ones below, without a costly `toString.call`.
		out = 'o';
		keys = Object.keys(input);
		if (keys.length === 1) {
			out += keys[0] + walk(input[keys[0]], seen, depth);
		} else {
			if (keys.length > 1) keys.sort();
			for (; i < keys.length; out += keys[i] + walk(input[keys[i++]], seen, depth));
		}
	} else {
		throw new Error('Unsupported value');
	}

	seen[ref] = out;
	return out;
}

/**
 * Canonicalize a value into a stable identity string. Two structurally-equal
 * inputs return the same id, regardless of key order. Use it as a cache key, or
 * to deduplicate structurally-equal values.
 *
 * Objects and `Map`s compare by key (order-independent); arrays and `Set`s keep
 * their order. Cycles are handled; exotic builtins (typed arrays, promises,
 * weakmaps, …) throw.
 *
 * @example
 * ```ts
 * identify({ a: 1, b: 2 }) === identify({ b: 2, a: 1 }); // true
 * ```
 */
export function identify<T>(input: T): string {
	return walk(input, [], 0);
}
