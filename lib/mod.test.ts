import {
	assert,
	assertEquals,
	assertInstanceOf,
	assertNotEquals,
	assertNotMatch,
	assertThrows,
} from '@std/assert';
import fc from 'fast-check';
import { identify } from '../lib/mod.ts';

Deno.test('exports', () => {
	assertInstanceOf(identify, Function);
});

Deno.test('arrays :: flat', () => {
	assertEquals(identify([1, 2, 3]), identify([1, 2, 3]));
});

Deno.test.ignore('arrays :: order is insignificant', () => {
	assertEquals(identify([3, 2, 1]), identify([1, 2, 3]));
});

Deno.test('arrays :: nested', () => {
	assertEquals(
		identify([
			[3, 2, 1],
			[1, 2, 3],
		]),
		identify([
			[3, 2, 1],
			[1, 2, 3],
		]),
	);
});

Deno.test('arrays :: circular', () => {
	const arr = [1, 2, 3];
	// @ts-expect-error circular
	arr.push(arr);
	assert(identify(arr));
	assertEquals(identify(arr), 'a123~1');
	assertEquals(identify(arr), identify(arr));
});

Deno.test('objects :: basic', () => {
	assertEquals(identify({ foo: 'bar' }), identify({ foo: 'bar' }));
});

Deno.test('objects :: key ordering', () => {
	assertEquals(
		identify({ one: 'one', two: 'two' }),
		identify({ two: 'two', one: 'one' }),
	);
});

Deno.test('objects :: complex keys', () => {
	const d = Date.now();
	assertEquals(
		identify({ [123]: 'one', [d]: 'two' }),
		identify({
			[123]: 'one',
			[d]: 'two',
		}),
	);
});

Deno.test('objects :: nested', () => {
	assertEquals(
		identify({ a: { b: 'c' }, d: { e: { f: 'g' } } }),
		identify({
			d: { e: { f: 'g' } },
			a: { b: 'c' },
		}),
	);
});

Deno.test('objects :: circular', () => {
	const o = { a: 'b' };
	// @ts-expect-error circular
	o['c'] = o;
	assert(identify(o));
	assertEquals(identify(o), identify(o));
});

Deno.test('objects :: partial circular', () => {
	const o = { v: 1 };
	const a = ['a', o];
	assertEquals(identify(a), identify(a));
});

// TODO: Right now they do match, because the o1 lookup is the same as o2
// as the reference is still the same, so the weakmap is the same
Deno.test.ignore('objects :: with samey circular should not match', () => {
	const o1: any = { a: 1, b: 2 };
	const o2: any = { a: 1, b: 2 };
	o1['c'] = o1;
	o1['d'] = o2;

	o2['c'] = o2; // 👈 #1

	const a = identify(o1);

	o2['c'] = o1; // 👈 different from #1

	const b = identify(o1);

	assertNotEquals(a, b, `${a} != ${b}`);
});

Deno.test('objects :: same values between types shouldnt match', () => {
	assertNotEquals(identify({ a: 'b' }), identify(['a', 'b']));
});

Deno.test('objects :: same hash for Map or Object', () => {
	assertEquals(identify({ a: 'b' }), identify(new Map([['a', 'b']])));
});

Deno.test.ignore('sets :: order is insignificant', () => {
	assertNotEquals(
		identify(new Set([1, 2, 3])),
		identify(new Set([3, 2, 1])),
	);
});

Deno.test.ignore('sets :: order is insignificant for object members', () => {
	assertNotEquals(
		identify(new Set([{ a: 'a' }, { b: 'b' }])),
		identify(new Set([{ b: 'b' }, { a: 'a' }])),
	);
});

Deno.test('sets :: circular', () => {
	const s = new Set([1, 2, 3]);
	// @ts-expect-error circular
	s.add(s);
	assert(identify(s));
	assertEquals(identify(s), identify(s));
});

Deno.test('maps :: basic', () => {
	assertEquals(
		identify(
			new Map([
				['a', 'b'],
				['c', 'd'],
			]),
		),
		identify(
			new Map([
				['c', 'd'],
				['a', 'b'],
			]),
		),
	);
});

Deno.test('maps :: circular', () => {
	const m = new Map([
		['a', 'b'],
		['c', 'd'],
	]);
	// @ts-expect-error circular
	m.set('e', m);
	assert(identify(m));
	assertEquals(identify(m), identify(m));
});

Deno.test('values :: primitives', () => {
	const t = (v: any) =>
		assertEquals(
			identify(v),
			identify(v),
			`Value ${v} should have hashed correctly.`,
		);

	t('test');
	t(new Date());
	t(NaN);
	t(true);
	t(false);
	t(/test/);
	t(123);
	t(null);
	t(undefined);
	// TODO: Solve for symbols
	// t(Symbol());
	// t(Symbol("test"));
});

Deno.test('values :: throws on unsupported builtins', () => {
	assertThrows(() => identify(new WeakMap()));
	assertThrows(() => identify(Promise.resolve()));
	assertThrows(() => identify(new Uint8Array([1, 2, 3])));
});

Deno.test('values :: hashes plain-shaped objects', () => {
	class Foo {
		a = 1;
		b = 2;
	}
	assertEquals(identify(new Foo()), identify(new Foo()));
	assertEquals(identify(new Foo()), identify({ a: 1, b: 2 }));

	const nullProto = Object.assign(Object.create(null), { a: 1, b: 2 });
	assertEquals(identify(nullProto), identify({ a: 1, b: 2 }));

	// A literal `constructor` key must still hash, not throw.
	assertEquals(identify({ constructor: 1 }), identify({ constructor: 1 }));
});

Deno.test('values :: circular ref should be consistent', () => {
	let o: any = { a: 1, c: 2 };
	o.b = o;
	o.d = new Map(); // the map is seen 2nd
	o.d.set('x', o.d);

	assertEquals(Object.keys(o), ['a', 'c', 'b', 'd']);

	const a = identify(o);

	o = { a: 1 };
	o.d = new Map(); // the map is seen first
	o.d.set('x', o.d);
	o.b = o;
	o.c = 2;

	assertEquals(Object.keys(o), ['a', 'd', 'b', 'c']);

	const b = identify(o);

	// the circular ref should be the same
	assertEquals(a, b, `${a} === ${b}`);
});

Deno.test('values :: circular deeply nested objects should equal', () => {
	const o1: any = {
		b: {
			c: 123,
		},
	};

	o1.b.d = o1;
	o1.x = [9, o1.b];

	const o2: any = {
		b: {
			c: 123,
		},
	};

	o2.b.d = o2;
	o2.x = [9, o2.b];
	const a = identify(o1);
	const b = identify(o2);
	assertEquals(a, b, `${a} === ${b}`);
});

Deno.test('values :: all elements visited', () => {
	const c = [1];
	// @ts-expect-error circular
	c.push(c);
	const hash = identify({
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
	});
	assertEquals(hash, 'oaobacadoefa1~5g');
});

Deno.test('values :: should only be seen once', () => {
	const hash = identify({
		a: [[1], [2], [3]],
		b: new Set([new Set([1]), new Set([2]), new Set([3])]),
	});
	assertNotMatch(hash, /~\d+/);
});

Deno.test('objects :: shared (non-circular) references are stable', () => {
	const shared = { v: 1 };
	// Sharing one instance must hash the same as two distinct equal instances.
	assertEquals(
		identify({ x: shared, y: shared }),
		identify({ x: { v: 1 }, y: { v: 1 } }),
	);
});

Deno.test('objects :: deeply nested input does not overflow', () => {
	let root: any = {};
	let node = root;
	for (let i = 0; i < 1000; i++) {
		node.i = i;
		node.child = {};
		node = node.child;
	}
	assert(identify(root));
	assertEquals(identify(root), identify(root));
});

Deno.test('objects :: realistic payload, key order never matters', () => {
	assertEquals(
		identify({
			id: 12345,
			name: 'a product',
			tags: ['a', 'b', 'c'],
			meta: { created: '2024-01-01', active: true, count: 42 },
		}),
		identify({
			meta: { count: 42, active: true, created: '2024-01-01' },
			tags: ['a', 'b', 'c'],
			name: 'a product',
			id: 12345,
		}),
	);
});

Deno.test('maps :: mixed key types, order independent', () => {
	assertEquals(
		identify(new Map<unknown, unknown>([['a', 1], [2, 'b'], ['c', 3]])),
		identify(new Map<unknown, unknown>([[2, 'b'], ['c', 3], ['a', 1]])),
	);
});

// ~> Property based tests

const keyArb = fc.constantFrom('a', 'b', 'c', 'd', 'foo', 'bar', '1', '2');
const leafArb = fc.oneof(
	fc.integer(),
	fc.double(),
	fc.string(),
	fc.boolean(),
	fc.constant(null),
	fc.constant(undefined),
	fc.date(),
	fc.constantFrom(/a/, /b/gi, /\d+/m),
);
const jsonish = fc.letrec((tie) => ({
	node: fc.oneof(
		{ maxDepth: 4 },
		leafArb,
		fc.array(tie('node'), { maxLength: 5 }),
		fc.array(tie('node'), { maxLength: 5 }).map((xs) => new Set(xs)),
		fc.array(fc.tuple(keyArb, tie('node')), { maxLength: 5 }).map((es) => new Map(es)),
		fc.dictionary(keyArb, tie('node'), { maxKeys: 5 }),
	),
})).node;

// Rebuilds a value with object/map key insertion order reversed at every level,
// while preserving array/set element order (which is significant).
function reorder(v: any): any {
	if (v === null || typeof v !== 'object' || v instanceof Date || v instanceof RegExp) return v;
	if (Array.isArray(v)) return v.map(reorder);
	if (v instanceof Set) {
		const s = new Set();
		for (const x of v) s.add(reorder(x));
		return s;
	}
	if (v instanceof Map) {
		const m = new Map();
		for (const [k, val] of [...v].reverse()) m.set(k, reorder(val));
		return m;
	}
	const o: Record<string, unknown> = {};
	for (const k of Object.keys(v).reverse()) o[k] = reorder(v[k]);
	return o;
}

Deno.test('fuzz :: identify is deterministic', () => {
	fc.assert(
		fc.property(jsonish, (v) => {
			const hash = identify(v);
			return typeof hash === 'string' && identify(v) === hash;
		}),
		{ numRuns: 1000 },
	);
});

Deno.test('fuzz :: object & map key order is irrelevant', () => {
	fc.assert(
		fc.property(jsonish, (v) => identify(v) === identify(reorder(v))),
		{ numRuns: 1000 },
	);
});
