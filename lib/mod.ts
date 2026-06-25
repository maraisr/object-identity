function walk(input: any, seen: any[]): string {
	if (input === null) return 'L';

	let type = typeof input;
	if (type !== 'object') {
		if (type === 'number') return input - input === 0 ? 'n' + input : 'L';
		if (type === 'string') return 's' + input;
		if (type === 'bigint') return 'n' + input;
		if (type === 'boolean') return input ? 'T' : 'F';
		if (type === 'undefined') return 'U';
		return '' + input;
	}

	// Arrays are the most common container, so settle them before the rarer
	// Date/RegExp leaves to keep the hot path short.
	let is_arr = Array.isArray(input);
	if (!is_arr) {
		if (input instanceof Date) return 'd' + +input;
		if (input instanceof RegExp) return 'r' + input.source + input.flags;
	}

	let ref: any = seen.indexOf(input);
	if (~ref) return '~' + (ref + 1);
	seen.push(input);

	let out: string, i = 0, keys: any, tmp: any;

	if (is_arr) {
		for (
			out = 'a';
			i < input.length;
			out += (tmp = input[i++]) === undefined ? 'L' : walk(tmp, seen)
		);
	} else if (input instanceof Set) {
		out = 'e';
		for (let value of input) out += value === undefined ? 'L' : walk(value, seen);
	} else if (input instanceof Map) {
		out = 'o';
		if (input.size > 1) {
			for (keys = [...input.keys()].sort(); i < keys.length; i++) {
				((tmp = input.get(keys[i])) !== undefined) && (out += keys[i] + walk(tmp, seen));
			}
		} else {
			for (keys of input) {
				((tmp = keys[1]) !== undefined) && (out += keys[0] + walk(tmp, seen));
			}
		}
	} // Plain objects, class instances and null-prototype objects have no
	// `Symbol.toStringTag`. Typed arrays (and other ArrayBuffer views) do, but
	// JSON treats them as index-keyed objects, so we walk their keys the same way.
	// Other exotic builtins (Promise, WeakMap, ArrayBuffer) fall through to the throw.
	else if (input[Symbol.toStringTag] === undefined || ArrayBuffer.isView(input)) {
		out = 'o';
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (; i < keys.length; i++) {
			if ((tmp = input[keys[i]]) !== undefined) out += keys[i] + walk(tmp, seen);
		}
	} else {
		throw new Error('Unsupported value');
	}

	seen.pop();
	return out;
}

/**
 * Canonicalize a value into a stable identity string. Two structurally-equal
 * inputs return the same id, regardless of key order.
 *
 * @example
 * ```ts
 * identify({ a: 1, b: 2 }) === identify({ b: 2, a: 1 }); // true
 * ```
 */
export function identify<T>(input: T): string {
	return walk(input, []);
}
