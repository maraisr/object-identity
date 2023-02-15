import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { identify as _identify } from '../src';

const identify = (x: any) => _identify(x, (v) => v);

// ~ API

const API = suite('exports');

API('should export a function', () => {
	assert.type(_identify, 'function');
});

API.run();

// ~ Arrays

const Arrays = suite('array');

Arrays('flat', () => {
	assert.equal(identify([1, 2, 3]), identify([1, 2, 3]));
});

Arrays('order should matter', () => {
	assert.not.equal(identify([3, 2, 1]), identify([1, 2, 3]));
});

Arrays('nested', () => {
	assert.equal(
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

Arrays('circular', () => {
	const arr = [1, 2, 3];
	// @ts-ignore
	arr.push(arr);
	assert.not.throws(() => identify(arr), /Maximum call stack size exceeded/);
	assert.equal(identify(arr), identify(arr));
});

Arrays('circular should know its circular', () => {
	const arr = [1, 2, 3];
	// @ts-ignore
	arr.push(arr);
	assert.equal(identify(arr), 'a123{C1}');
});

Arrays.run();

// ~ Objects

const Objects = suite('object');

Objects('basic', () => {
	assert.equal(identify({ foo: 'bar' }), identify({ foo: 'bar' }));
});

Objects('key ordering', () => {
	assert.equal(
		identify({ one: 'one', two: 'two' }),
		identify({ two: 'two', one: 'one' }),
	);
});

Objects('complex keys', () => {
	const d = Date.now();
	assert.equal(
		identify({ [123]: 'one', [d]: 'two' }),
		identify({
			[123]: 'one',
			[d]: 'two',
		}),
	);
});

Objects('nested', () => {
	assert.equal(
		identify({ a: { b: 'c' }, d: { e: { f: 'g' } } }),
		identify({
			d: { e: { f: 'g' } },
			a: { b: 'c' },
		}),
	);
});

Objects('circular', () => {
	const o = { a: 'b' };
	// @ts-ignore
	o['c'] = o;
	assert.not.throws(() => identify(o), /Maximum call stack size exceeded/);
	assert.equal(identify(o), identify(o));
});

Objects('with samey circular shoudlnt match', () => {
	const o1: any = { a: 1, b: 2 };
	const o2: any = { a: 1, b: 2 };
	o1['c'] = o1;
	o1['d'] = o2;
	o2['c'] = o2;

	const a = identify(o1);
	o1['c'] = o1;
	o1['d'] = o2;
	o2['c'] = o1; // 👈 circular on first object, different from a which is circular on 2nd object
	const b = identify(o1);

	assert.not.equal(a, b, `${a} != ${b}`);
});

Objects('same values between types shouldnt match', () => {
	assert.not.equal(identify({ a: 'b' }), identify(['a', 'b']));
});

Objects('same hash for Map or Object', () => {
	assert.equal(identify({ a: 'b' }), identify(new Map([['a', 'b']])));
});

Objects.run();

// ~ Sets

const Sets = suite('set');

Sets('shouldnt be ordered', () => {
	assert.not.equal(
		identify(new Set([1, 2, 3])),
		identify(new Set([3, 2, 1])),
	);
});

Sets('shouldnt be ordered', () => {
	assert.not.equal(
		identify(new Set([{ a: 'a' }, { b: 'b' }])),
		identify(new Set([{ b: 'b' }, { a: 'a' }])),
	);
});

Sets('circular', () => {
	const s = new Set([1, 2, 3]);
	// @ts-ignore
	s.add(s);
	assert.not.throws(() => identify(s), /Maximum call stack size exceeded/);
	assert.equal(identify(s), identify(s));
});

Sets.run();

// ~ Maps

const Maps = suite('map');

Maps('basic', () => {
	assert.equal(
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

Maps('circular', () => {
	const m = new Map([
		['a', 'b'],
		['c', 'd'],
	]);
	// @ts-ignore
	m.set('e', m);
	assert.not.throws(() => identify(m), /Maximum call stack size exceeded/);
	assert.equal(identify(m), identify(m));
});

Maps.run();

// ~ Values

const Values = suite('values');

Values('primitives', () => {
	const t = (v: any) =>
		assert.equal(
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

Values('circular ref should be consistent', () => {
	let o: any = { a: 1, c: 2 };
	o.b = o;
	o.d = new Map(); // the map is seen 2nd
	o.d.set('x', o.d);

	assert.equal(Object.keys(o), ['a', 'c', 'b', 'd']);

	const a = identify(o);

	o = { a: 1 };
	o.d = new Map(); // the map is seen first
	o.d.set('x', o.d);
	o.b = o;
	o.c = 2;

	assert.equal(Object.keys(o), ['a', 'd', 'b', 'c']);

	const b = identify(o);

	// the circular ref should be the same
	assert.equal(a, b, `${a} === ${b}`);
});

Values('circular deeply nested objects should equal', () => {
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
	assert.equal(a, b, `${a} === ${b}`);
});

Values('all elements visited', () => {
	const c = [1];
	// @ts-ignore
	c.push(c);
	const hash = identify({
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
	});
	assert.equal(hash, 'oaobacadoefa1{C5}g');
});

Values('should only be seen once', () => {
	const hash = identify({
		a: [[1], [2], [3]],
		b: new Set([new Set([1]), new Set([2]), new Set([3])]),
	});
	assert.not.match(hash, /{C\d+}/);
});

Values.run();
