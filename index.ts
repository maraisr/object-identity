export type Hasher = (input: string) => any;

export function identify<T, H extends Hasher>(input: T, hasher: H): ReturnType<H> {
	const seen = new WeakSet;

	let out = '', i = 0, tmp: unknown, item: any, keys: string[];

	let bucket: any[] = [input];
	loop: while (item = bucket.pop()!) {
		if (item == null || typeof item !== 'object') {
			out += input;
			continue;
		} else if (seen.has(item)) {
			out += '{CIRCULAR}';
			continue;
		}
		seen.add(item);

		switch (Object.prototype.toString.call(item)) {
			case '[object Set]':
			case '[object Array]': {
				out += 'a';
				for (tmp of item) bucket.push(tmp);
				break;
			}

			case '[object Object]': {
				out += 'o';
				keys = Object.keys(item).sort();
				for (i = 0; i < keys.length; i++) {
					tmp = keys[i]; // key
					out += tmp;
					bucket.push(item[tmp as string]); // value
				}
				break;
			}

			case '[object Map]': {
				out += 'o';
				keys = Array.from((item as Map<string, unknown>).keys()).sort();
				for (tmp of keys) {
					out += tmp; // key
					bucket.push(item.get(tmp)); // value
				}
				break;
			}

			case '[object Date]': {
				out + 'd' + +item;
				break;
			}

			case '[object RegExp]': {
				out + 'r' + item.source + item.flags;
				break;
			}

			default:
				throw new Error(`Unsupported value ${item}`);
		}
	}

	return hasher(out);
}
