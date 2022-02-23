function walk(input: any, seen: WeakSet<any>) {
	if (input == null || typeof input !== 'object') return input;
	if (seen.has(input)) return '{CIRCULAR}';
	seen.add(input);

	let out = '', i = 0, tmp: unknown, keys: string[];

	switch (Object.prototype.toString.call(input)) {
		case '[object Set]':
		case '[object Array]': {
			out += 'a';
			for (tmp of input) out += walk(tmp, seen);
			return out;
		}

		case '[object Object]': {
			out += 'o';
			keys = Object.keys(input).sort();
			for (i = 0; i < keys.length; i++) {
				tmp = keys[i];
				out += tmp + walk(input[tmp as string], seen);
			}
			return out;
		}

		case '[object Map]': {
			out += 'o';
			keys = Array.from((input as Map<string, unknown>).keys()).sort();
			for (tmp of keys) out += tmp + walk(input.get(tmp), seen);
			return out;
		}

		case '[object Date]':
			return out + 'd' + +input;

		case '[object RegExp]':
			return out + 'r' + input.source + input.flags;

		default:
			throw new Error(`Unsupported value ${input}`);
	}
}

export type Hasher = (input: string) => any;

export function identify<T, H extends Hasher>(input: T, hasher: H): ReturnType<H> {
	return hasher(walk(input, new WeakSet));
}
