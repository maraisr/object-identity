function walk(input: any, seen: WeakMap<any, number>, ref_index: number) {
	if (input == null || typeof input !== 'object') return String(input);
	if (seen.has(input)) return `{C${seen.get(input)}}`;
	seen.set(input, ++ref_index);

	let out = '',
		i = 0,
		tmp: any;

	switch (Object.prototype.toString.call(input)) {
		case '[object Set]':
			tmp = Array.from(input);
		case '[object Array]': {
			tmp ||= input;
			out += 'a';
			for (; i < tmp.length; out += walk(tmp[i++], seen, ref_index));
			return out;
		}

		case '[object Object]': {
			out += 'o';
			tmp = Object.keys(input).sort();
			for (; i < tmp.length; out += tmp[i] + walk(input[tmp[i++]], seen, ref_index));
			return out;
		}

		case '[object Map]': {
			out += 'o';
			tmp = Array.from((input as Map<string, unknown>).keys()).sort();
			for (; i < tmp.length; out += tmp[i] + walk(input.get(tmp[i++]), seen, ref_index));
			return out;
		}

		case '[object Date]':
			return 'd' + +input;

		case '[object RegExp]':
			return 'r' + input.source + input.flags;

		default:
			throw new Error(`Unsupported value ${input}`);
	}
}

export function identify<T>(input: T): string {
	return walk(input, new WeakMap(), 0);
}
