let seen = new WeakMap<object, number>()

function walk(input: any, ref_index: number) {
	let type = Object.prototype.toString.call(input)
	let out = '';
	let i = 0;
	let tmp: any;

	if (type !== '[object RegExp]' && type !== '[object Date]') {
		if (input == null || typeof input !== 'object') return String(input);

		if (seen.has(input)) return '~' + seen.get(input);
		seen.set(input, ++ref_index);
	}

	switch (type) {
		case '[object Set]':
			tmp = Array.from(input);
		case '[object Array]': {
			tmp ||= input;
			out += 'a';
			for (; i < tmp.length; out += walk(tmp[i++], ref_index));
			return out;
		}

		case '[object Object]': {
			out += 'o';
			tmp = Object.keys(input).sort();
			for (; i < tmp.length; out += tmp[i] + walk(input[tmp[i++]], ref_index));
			return out;
		}

		case '[object Map]': {
			out += 'o';
			tmp = Array.from((input as Map<string, unknown>).keys()).sort();
			for (; i < tmp.length; out += tmp[i] + walk(input.get(tmp[i++]), ref_index));
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
	return walk(input, 0);
}
