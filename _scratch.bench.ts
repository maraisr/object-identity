// Scratch benchmark to compare walk() variants. Deleted after use.

// ---------- ORIGINAL ----------
{
	let seen = new WeakMap<object, string>();
	function walk(input: any, ref_index: number) {
		if (input == null || typeof input !== 'object') return String(input);
		let tmp: any;
		let out = '';
		let i = 0;
		let type = Object.prototype.toString.call(input);
		if (!(type === '[object RegExp]' || type === '[object Date]') && seen.has(input)) {
			return seen.get(input)!;
		}
		seen.set(input, '~' + ++ref_index);
		switch (type) {
			case '[object Set]':
				tmp = Array.from(input as Set<unknown>);
			case '[object Array]': {
				tmp ||= input;
				out += 'a';
				for (; i < tmp.length; out += walk(tmp[i++], ref_index));
			} break;
			case '[object Object]': {
				out += 'o';
				tmp = Object.keys(input).sort();
				for (; i < tmp.length; out += tmp[i] + walk(input[tmp[i++]], ref_index));
			} break;
			case '[object Map]': {
				out += 'o';
				tmp = Array.from((input as Map<string, unknown>).keys()).sort();
				for (; i < tmp.length; out += tmp[i] + walk(input.get(tmp[i++]), ref_index));
			} break;
			case '[object Date]': return 'd' + +input;
			case '[object RegExp]': return 'r' + (input as RegExp).source + (input as RegExp).flags;
			default: throw new Error(`Unsupported value ${input}`);
		}
		seen.set(input, out);
		return out;
	}
	(globalThis as any).orig = (input: any) => walk(input, 0);
}

// ---------- A: instanceof, Date/RegExp pre-seen, single get ----------
{
	let seen = new WeakMap<object, string>();
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		if (x instanceof Date) return 'd' + +x;
		if (x instanceof RegExp) return 'r' + x.source + x.flags;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any;
		if (Array.isArray(x)) {
			out = 'a';
			for (; i < x.length; out += walk(x[i++], d));
		} else if (x instanceof Set) {
			out = 'a';
			for (let v of x) out += walk(v, d);
		} else if (x instanceof Map) {
			out = 'o';
			k = [...x.keys()].sort();
			for (; i < k.length; out += k[i] + walk(x.get(k[i++]), d));
		} else {
			out = 'o';
			k = Object.keys(x).sort();
			for (; i < k.length; out += k[i] + walk(x[k[i++]], d));
		}
		seen.set(x, out);
		return out;
	}
	(globalThis as any).variantA = (input: any) => walk(input, 0);
}

// ---------- B: like A but for..of unified for Array+Set ----------
{
	let seen = new WeakMap<object, string>();
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		if (x instanceof Date) return 'd' + +x;
		if (x instanceof RegExp) return 'r' + x.source + x.flags;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any;
		if (x instanceof Map) {
			out = 'o';
			k = [...x.keys()].sort();
			for (; i < k.length; out += k[i] + walk(x.get(k[i++]), d));
		} else if (Array.isArray(x) || x instanceof Set) {
			out = 'a';
			for (let v of x) out += walk(v, d);
		} else {
			out = 'o';
			k = Object.keys(x).sort();
			for (; i < k.length; out += k[i] + walk(x[k[i++]], d));
		}
		seen.set(x, out);
		return out;
	}
	(globalThis as any).variantB = (input: any) => walk(input, 0);
}

// ---------- C: constructor-based dispatch ----------
{
	let seen = new WeakMap<object, string>();
	function walk(x: any, d: number): string {
		if (x === null || typeof x !== 'object') return '' + x;
		let c = x.constructor;
		if (c === Date) return 'd' + +x;
		if (c === RegExp) return 'r' + x.source + x.flags;
		let ref = seen.get(x);
		if (ref) return ref;
		seen.set(x, '~' + ++d);
		let out: string, i = 0, k: any;
		if (c === Array) {
			out = 'a';
			for (; i < x.length; out += walk(x[i++], d));
		} else if (c === Set) {
			out = 'a';
			for (let v of x) out += walk(v, d);
		} else if (c === Map) {
			out = 'o';
			k = [...x.keys()].sort();
			for (; i < k.length; out += k[i] + walk(x.get(k[i++]), d));
		} else {
			out = 'o';
			k = Object.keys(x).sort();
			for (; i < k.length; out += k[i] + walk(x[k[i++]], d));
		}
		seen.set(x, out);
		return out;
	}
	(globalThis as any).variantC = (input: any) => walk(input, 0);
}

const getObject = () => {
	const c: any = [1];
	c.push(c);
	return {
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
		d: new Date(),
		r: /a/,
	};
};

// correctness check
const g = globalThis as any;
const ref = g.orig(getObject());
for (const name of ['variantA', 'variantB', 'variantC']) {
	const got = g[name](getObject());
	if (got !== ref) console.error(`MISMATCH ${name}: ${got} !== ${ref}`);
	else console.error(`OK ${name}: ${got}`);
}

for (const name of ['orig', 'variantA', 'variantB', 'variantC']) {
	Deno.bench({ name, group: 'bench-object', baseline: name === 'orig', fn() { g[name](getObject()); } });
}

// a flatter, more realistic payload
const realistic = () => ({
	id: 12345,
	name: 'a product name',
	price: 19.99,
	tags: ['a', 'b', 'c', 'd'],
	meta: { created: '2024-01-01', updated: '2024-06-01', active: true, count: 42 },
	nested: { a: { b: { c: { d: 1 } } } },
});
for (const name of ['orig', 'variantA', 'variantB', 'variantC']) {
	Deno.bench({ name, group: 'realistic', baseline: name === 'orig', fn() { g[name](realistic()); } });
}
