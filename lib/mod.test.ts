import {
	assert,
	assertEquals,
	assertInstanceOf,
	assertNotEquals,
	assertNotMatch,
} from '@std/assert';
import { identify } from '../lib/mod.ts';

Deno.test('exports', () => {
	assertInstanceOf(identify, Function);
});

Deno.test('arrays :: flat', () => {
	assertEquals(identify([1, 2, 3]), identify([1, 2, 3]));
});

Deno.test('arrays :: order should not matter', () => {
	assertNotEquals(identify([3, 2, 1]), identify([1, 2, 3]));
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

// Right now they do match, because the o1 lookup is the same as o2
// as the reference is still the same, so the weakmap is the same
/*Objects.skip('with samey circular shoudlnt match', () => {
	const o1: any = { a: 1, b: 2 };
	const o2: any = { a: 1, b: 2 };
	o1['c'] = o1;
	o1['d'] = o2;

	o2['c'] = o2; // 👈 #1

	const a = identify(o1);

	o2['c'] = o1; // 👈 different from #1

	const b = identify(o1);

	assertNotEquals(a, b, `${a} != ${b}`);
});*/

Deno.test('objects :: same values between types shouldnt match', () => {
	assertNotEquals(identify({ a: 'b' }), identify(['a', 'b']));
});

Deno.test('objects :: same hash for Map or Object', () => {
	assertEquals(identify({ a: 'b' }), identify(new Map([['a', 'b']])));
});

Deno.test('sets :: shouldnt be ordered', () => {
	assertNotEquals(
		identify(new Set([1, 2, 3])),
		identify(new Set([3, 2, 1])),
	);
});

Deno.test('sets :: shouldnt be ordered', () => {
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
