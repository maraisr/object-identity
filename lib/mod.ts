const decoder = new TextDecoder();

type Writer = {
	bytes: Uint8Array<ArrayBufferLike>;
	offset: number;
	parts?: string[];
};

function reserve(writer: Writer, needed: number): void {
	if (writer.offset + needed <= writer.bytes.length) return;
	const next = new Uint8Array(Math.max(writer.offset + needed, writer.bytes.length * 2));
	next.set(writer.bytes);
	writer.bytes = next;
}

function write_code(writer: Writer, code: number): void {
	if (writer.parts) writer.parts.push(String.fromCharCode(code));
	else {
		reserve(writer, 1);
		writer.bytes[writer.offset++] = code;
	}
}

function write_string(writer: Writer, value: string): void {
	if (!value.length) return;
	if (writer.parts) {
		writer.parts.push(value);
		return;
	}

	reserve(writer, value.length);
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);
		if (code < 128) writer.bytes[writer.offset++] = code;
		else {
			writer.parts = [decoder.decode(writer.bytes.subarray(0, writer.offset)), value.slice(i)];
			return;
		}
	}
}

function finish(writer: Writer): string {
	return writer.parts
		? writer.parts.join('')
		: decoder.decode(writer.bytes.subarray(0, writer.offset));
}

function sort_keys(keys: string[]): void {
	let sorted = true;
	for (let i = 1; i < keys.length; i++) {
		if (keys[i - 1] > keys[i]) {
			sorted = false;
			break;
		}
	}
	if (sorted) return;

	if (keys.length > 32) {
		keys.sort();
		return;
	}

	for (let i = 1, j: number, key: string; i < keys.length; i++) {
		key = keys[i];
		for (j = i - 1; j >= 0 && keys[j] > key; j--) keys[j + 1] = keys[j];
		keys[j + 1] = key;
	}
}

function write_array(input: any[], seen: any[], writer: Writer): void {
	write_code(writer, 97); // a
	if (input.length < 64 || writer.parts) {
		for (let i = 0; i < input.length; i++) {
			if (!walk(input[i], seen, writer)) write_code(writer, 76);
		}
		return;
	}

	let bytes = writer.bytes, offset = writer.offset;
	for (let i = 0, value: any, type: string, text: string; i < input.length; i++) {
		value = input[i];
		if (offset === bytes.length) {
			const grown = new Uint8Array(bytes.length * 2);
			grown.set(bytes);
			bytes = grown;
		}

		if (value === null) {
			bytes[offset++] = 76;
			continue;
		}

		type = typeof value;
		if (type === 'number') {
			if (value - value !== 0) {
				bytes[offset++] = 76;
				continue;
			}
			bytes[offset++] = 110;
			text = '' + value;
		} else if (type === 'string') {
			bytes[offset++] = 115;
			text = value;
		} else if (type === 'bigint') {
			bytes[offset++] = 110;
			text = '' + value;
		} else if (type === 'boolean') {
			bytes[offset++] = value ? 84 : 70;
			continue;
		} else if (type !== 'object') {
			bytes[offset++] = 76;
			continue;
		} else {
			writer.bytes = bytes;
			writer.offset = offset;
			if (!walk(value, seen, writer)) write_code(writer, 76);
			if (writer.parts) {
				for (i++; i < input.length; i++) {
					if (!walk(input[i], seen, writer)) write_code(writer, 76);
				}
				return;
			}
			bytes = writer.bytes;
			offset = writer.offset;
			continue;
		}

		while (offset + text.length > bytes.length) {
			const grown = new Uint8Array(bytes.length * 2);
			grown.set(bytes);
			bytes = grown;
		}
		const start = offset - 1;
		for (let j = 0; j < text.length; j++) {
			const code = text.charCodeAt(j);
			if (code > 127) {
				writer.bytes = bytes;
				writer.offset = start;
				if (!walk(value, seen, writer)) write_code(writer, 76);
				for (i++; i < input.length; i++) {
					if (!walk(input[i], seen, writer)) write_code(writer, 76);
				}
				return;
			}
			bytes[offset++] = code;
		}
	}

	writer.bytes = bytes;
	writer.offset = offset;
}

function walk(input: any, seen: any[], writer: Writer): boolean {
	if (input === null) {
		write_code(writer, 76); // L
		return true;
	}

	let type = typeof input;
	if (type !== 'object') {
		if (type === 'number') {
			if (input - input !== 0) write_code(writer, 76);
			else {
				write_code(writer, 110); // n
				write_string(writer, '' + input);
			}
			return true;
		}
		if (type === 'string') {
			write_code(writer, 115); // s
			write_string(writer, input);
			return true;
		}
		if (type === 'bigint') {
			write_code(writer, 110);
			write_string(writer, '' + input);
			return true;
		}
		if (type === 'boolean') {
			write_code(writer, input ? 84 : 70); // T/F
			return true;
		}
		return false;
	}

	let is_array = Array.isArray(input);
	if (!is_array) {
		if (input instanceof Date) {
			write_code(writer, 100); // d
			write_string(writer, '' + +input);
			return true;
		}
		if (input instanceof RegExp) {
			write_code(writer, 114); // r
			write_string(writer, input.source);
			write_string(writer, input.flags);
			return true;
		}
	}

	let index = seen.indexOf(input);
	if (index !== -1) {
		write_code(writer, 126); // ~
		write_string(writer, '' + (index + 1));
		return true;
	}

	const original = input;
	if (typeof input.toJSON === 'function' && !ArrayBuffer.isView(input)) {
		input = input.toJSON();
		if (input === null || typeof input !== 'object') return walk(input, seen, writer);
		index = seen.indexOf(input);
		if (index !== -1) {
			write_code(writer, 126);
			write_string(writer, '' + (index + 1));
			return true;
		}
		is_array = Array.isArray(input);
	}
	seen.push(original);

	if (is_array) write_array(input, seen, writer);
	else if (input instanceof Set) {
		write_code(writer, 101); // e
		for (const value of input) if (!walk(value, seen, writer)) write_code(writer, 76);
	} else if (input instanceof Map) {
		const keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		write_code(writer, 111); // o
		const child: Writer = { bytes: new Uint8Array(64), offset: 0 };

		for (let i = 0; i < keys.length; i++) {
			child.offset = 0;
			child.parts = undefined;
			if (walk(input.get(keys[i]), seen, child)) {
				write_string(writer, '' + keys[i]);
				write_string(writer, finish(child));
			}
			if (child.parts) child.parts.length = 0;
		}
	} else if (input[Symbol.toStringTag] === undefined || ArrayBuffer.isView(input)) {
		const keys = Object.keys(input);
		if (keys.length > 1) sort_keys(keys);
		write_code(writer, 111);

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const offset = writer.offset;
			const parts = writer.parts;
			const parts_length = parts?.length;
			const value = input[key];
			write_string(writer, key);
			if (!walk(value, seen, writer)) {
				writer.offset = offset;
				if (parts) {
					writer.parts = parts;
					parts.length = parts_length!;
				} else writer.parts = undefined;
			}
		}
	} else throw new Error('Unsupported value');

	seen.pop();
	return true;
}

let pooled: Uint8Array<ArrayBufferLike> = new Uint8Array(256);
let pooled_writer: Writer = { bytes: pooled, offset: 0 };
let pooled_seen: any[] = [], leased = false;

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
	if (input === null) return 'L';
	const type = typeof input;
	if (type === 'number') return (input as number) - (input as number) === 0 ? 'n' + input : 'L';
	if (type === 'string') return 's' + input;
	if (type === 'bigint') return 'n' + input;
	if (type === 'boolean') return input ? 'T' : 'F';
	if (type !== 'object') return 'U';
	if (input instanceof Date) return 'd' + +input;
	if (input instanceof RegExp) return 'r' + input.source + input.flags;

	const outer = !leased;
	const writer: Writer = outer ? pooled_writer : { bytes: new Uint8Array(256), offset: 0 };
	const seen = outer ? pooled_seen : [];
	if (outer) leased = true;
	writer.offset = 0;
	writer.parts = undefined;

	try {
		return walk(input, seen, writer) ? finish(writer) : 'U';
	} finally {
		if (outer) {
			leased = false;
			seen.length = 0;
			(writer.parts as string[] | undefined)?.splice(0);
			if (writer.bytes.length <= 16384) pooled = writer.bytes;
			writer.bytes = pooled;
		}
	}
}
