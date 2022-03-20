import type { identify as _identify } from 'object-identity';

function walk(input: any, seen: WeakMap<any, number>, ref_index: number) {
	if (input == null || typeof input !== 'object') return input;
	if (seen.has(input)) return `{C${seen.get(input)}}`;
	seen.set(input, ++ref_index);

	let out = '', i = 0, tmp: unknown, keys: string[];

	switch (Object.prototype.toString.call(input)) {
		case '[object Set]':
		case '[object Array]': {
			out += 'a';
			for (tmp of input) out += walk(tmp, seen, ref_index);
			return out;
		}

		case '[object Object]': {
			out += 'o';
			keys = Object.keys(input).sort();
			for (i = 0; i < keys.length; i++) {
				tmp = keys[i];
				out += tmp + walk(input[tmp as string], seen, ref_index);
			}
			return out;
		}

		case '[object Map]': {
			out += 'o';
			keys = Array.from((input as Map<string, unknown>).keys()).sort();
			for (tmp of keys) out += tmp + walk(input.get(tmp), seen, ref_index);
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

export const identify: typeof _identify = (input, hasher) =>
	hasher(walk(input, new WeakMap, 0));
