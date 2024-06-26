let seen = new WeakMap<object, string>();

function walk(input: any, ref_index: number) {
	if (input == null || typeof input !== 'object') return String(input);

	let tmp: any;
	let out = '';
	let i = 0;
	let type = Object.prototype.toString.call(input);
	if (
		!(type === '[object RegExp]' || type === '[object Date]') &&
		seen.has(input)
	) {
		return seen.get(input)!;
	}
	seen.set(input, '~' + ++ref_index);

	switch (type) {
		case '[object Set]':
			tmp = Array.from(input as Set<unknown>);
		case '[object Array]':
			{
				tmp ||= input;
				out += 'a';
				for (; i < tmp.length; out += walk(tmp[i++], ref_index));
			}
			break;

		case '[object Object]':
			{
				out += 'o';
				tmp = Object.keys(input).sort();
				for (
					;
					i < tmp.length;
					out += tmp[i] + walk(input[tmp[i++]], ref_index)
				);
			}
			break;

		case '[object Map]':
			{
				out += 'o';
				tmp = Array.from((input as Map<string, unknown>).keys()).sort();
				for (
					;
					i < tmp.length;
					out += tmp[i] + walk(input.get(tmp[i++]), ref_index)
				);
			}
			break;

		case '[object Date]':
			return 'd' + +input;

		case '[object RegExp]':
			return 'r' + input.source + input.flags;

		default:
			throw new Error(`Unsupported value ${input}`);
	}

	seen.set(input, out);
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
	return walk(input, 0);
}
