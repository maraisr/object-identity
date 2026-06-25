function walk(input: any, seen: any[]): string | undefined {
	if (input === null) return 'L';

	let out: string, i = 0, keys: any, tmp: any;

	if ((tmp = typeof input) !== 'object') {
		if (tmp === 'number') return input - input === 0 ? 'n' + input : 'L';
		if (tmp === 'string') return 's' + input;
		if (tmp === 'bigint') return 'n' + input;
		if (tmp === 'boolean') return input ? 'T' : 'F';
		return;
	}

	let is_arr = Array.isArray(input);
	if (!is_arr) {
		if (input instanceof Date) return 'd' + +input;
		if (input instanceof RegExp) return 'r' + input.source + input.flags;

		if (typeof input.toJSON === 'function' && !ArrayBuffer.isView(input)) {
			input = input.toJSON();
			if (input === null) return 'L';
			if (typeof input !== 'object') return walk(input, seen);
			is_arr = Array.isArray(input);
		}
	}

	tmp = seen.indexOf(input);
	if (~tmp) return '~' + (tmp + 1);
	seen.push(input);

	if (is_arr) {
		for (
			out = 'a';
			i < input.length;
			out += (tmp = walk(input[i++], seen)) === undefined ? 'L' : tmp
		);
	} else if (input instanceof Set) {
		out = 'e';
		for (let value of input) out += (tmp = walk(value, seen)) === undefined ? 'L' : tmp;
	} else if (input instanceof Map) {
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (out = 'o'; i < keys.length; i++) {
			if ((tmp = walk(input.get(keys[i]), seen)) !== undefined) out += keys[i] + tmp;
		}
	} else if (input[Symbol.toStringTag] === undefined || ArrayBuffer.isView(input)) {
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (out = 'o'; i < keys.length; i++) {
			if ((tmp = walk(input[keys[i]], seen)) !== undefined) out += keys[i] + tmp;
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
	return walk(input, []) ?? 'U';
}
