function walk(input: any, seen: any[]): string | undefined {
	if (input === null) return 'L';

	let t = typeof input;
	if (t !== 'object') {
		if (t === 'number') return input - input === 0 ? 'n' + input : 'L';
		if (t === 'string') return 's' + input;
		if (t === 'bigint') return 'n' + input;
		if (t === 'boolean') return input ? 'T' : 'F';
		return;
	}

	let is_arr = Array.isArray(input);
	if (!is_arr) {
		if (input instanceof Date) return 'd' + +input;
		if (input instanceof RegExp) return 'r' + input.source + input.flags;
	}

	let idx = seen.indexOf(input);
	if (idx !== -1) return '~' + (idx + 1);

	let original = input;
	if (typeof input.toJSON === 'function' && !ArrayBuffer.isView(input)) {
		input = input.toJSON();
		if (input === null || typeof input !== 'object') return walk(input, seen);
		idx = seen.indexOf(input);
		if (idx !== -1) return '~' + (idx + 1);
		is_arr = Array.isArray(input);
	}
	seen.push(original);

	let out: string, i = 0, tmp: string | undefined, keys: any;

	if (is_arr) {
		out = 'a';
		for (let len = input.length, v: any, vt: any; i < len; i++) {
			v = input[i];
			if (v === null) out += 'L';
			else if ((vt = typeof v) === 'object') {
				out += (tmp = walk(v, seen)) === undefined ? 'L' : tmp;
			} else if (vt === 'number') out += v - v === 0 ? 'n' + v : 'L';
			else if (vt === 'string') out += 's' + v;
			else if (vt === 'boolean') out += v ? 'T' : 'F';
			else if (vt === 'bigint') out += 'n' + v;
			else out += 'L';
		}
	} else if (input instanceof Set) {
		out = 'e';
		for (let value of input) out += (tmp = walk(value, seen)) === undefined ? 'L' : tmp;
	} else if (input instanceof Map) {
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (out = 'o'; i < keys.length; i++) {
			if ((tmp = walk(input.get(keys[i]), seen)) !== undefined) {
				out += keys[i];
				out += tmp;
			}
		}
	} else if (input[Symbol.toStringTag] === undefined || ArrayBuffer.isView(input)) {
		keys = Object.keys(input);
		if (keys.length > 32) keys.sort();
		else sort_keys(keys);
		out = 'o';
		for (let k: string; i < keys.length; i++) {
			if ((tmp = walk(input[k = keys[i]], seen)) !== undefined) {
				out += k;
				out += tmp;
			}
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
	let seen: any[] = [input];
	seen.pop();
	return walk(input, seen) ?? 'U';
}

// ---

function sort_keys(keys: string[]): void {
	for (let i = 1, j: number, k: string; i < keys.length; i++) {
		k = keys[i];
		for (j = i - 1; j >= 0 && keys[j] > k; j--) keys[j + 1] = keys[j];
		keys[j + 1] = k;
	}
}
