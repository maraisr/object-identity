import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { identify as _identify } from '.';

const identify = (x: any) => _identify(x, v => v);

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
	assert.equal(identify([[3, 2, 1], [1, 2, 3]]), identify([[3, 2, 1], [1, 2, 3]]));
});

Arrays('circular', () => {
	const arr = [1, 2, 3];
	// @ts-ignore
	arr.push(arr);
	assert.not.throws(() => identify(arr), /Maximum call stack size exceeded/);
	assert.equal(identify(arr), identify(arr));
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
		identify(new Map([['a', 'b'], ['c', 'd']])),
		identify(new Map([['c', 'd'], ['a', 'b']])),
	);
});

Maps('circular', () => {
	const m = new Map([['a', 'b'], ['c', 'd']]);
	// @ts-ignore
	m.set('e', m);
	assert.not.throws(() => identify(m), /Maximum call stack size exceeded/);
	assert.equal(
		identify(m),
		identify(m),
	);
});

Maps.run();

// ~ Values

const Values = suite('values');

Values('primitives', () => {
	const t = (v: any) => assert.equal(identify(v), identify(v), `Value ${v} should have hashed correctly.`);

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

Values('all elements visited', () => {
	const c = [1];
	// @ts-ignore
	c.push(c);
	const hash = identify({ a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] } });
	assert.equal(hash, 'oaobacadoefa1{CIRCULAR}g');
});

Values.run();
