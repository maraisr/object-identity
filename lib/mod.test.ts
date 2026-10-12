import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { Buffer } from 'node:buffer';
import { identify } from '../lib/mod.ts';

test('exports :: identify is a function', () => {
	assert.deepEqual(typeof identify, 'function');
});

// ~> Primitives

test('primitives :: are deterministic', () => {
	const stable = (v: unknown) =>
		assert.deepEqual(identify(v), identify(v), `${String(v)} is unstable`);
	stable('hello');
	stable('');
	stable(0);
	stable(-0);
	stable(123);
	stable(-4.5);
	stable(NaN);
	stable(Infinity);
	stable(-Infinity);
	stable(true);
	stable(false);
	stable(null);
	stable(undefined);
	stable(123n);
});

test('primitives :: distinct values are distinct', () => {
	assert.notDeepEqual(identify(1), identify(2));
	assert.notDeepEqual(identify('a'), identify('b'));
	assert.notDeepEqual(identify(true), identify(false));
	assert.notDeepEqual(identify(1.5), identify(1.50001));
	assert.notDeepEqual(identify(''), identify(' '));
});

test('primitives :: are distinct from their string form', () => {
	// A number, boolean, or null is its own thing, never its text spelling.
	assert.notDeepEqual(identify(1), identify('1'));
	assert.deepEqual(identify('1'), identify('1'));
	assert.notDeepEqual(identify(true), identify('true'));
	assert.notDeepEqual(identify(null), identify('null'));
	assert.notDeepEqual(identify(undefined), identify('undefined'));
});

test('strings :: preserve exact content', () => {
	assert.deepEqual(identify('café'), identify('café'));
	assert.deepEqual(identify('a\n\t"b'), identify('a\n\t"b'));
	assert.notDeepEqual(identify('a'), identify('A'));
	assert.notDeepEqual(identify('ab'), identify('a b'));
	// A unicode round-trip over a wide range stays deterministic.
	for (let i = 0; i < 0x2000; i += 7) {
		const s = String.fromCharCode(i);
		assert.deepEqual(identify(s), identify(s));
	}
});

test('numbers :: float precision is retained', () => {
	assert.deepEqual(identify(0.1 + 0.2), identify(0.30000000000000004));
	assert.notDeepEqual(identify(0.1 + 0.2), identify(0.3));
	assert.notDeepEqual(identify(1), identify(1.0000000000000002));
});

test('numbers :: signed zero collapses', () => {
	// -0 and 0 are conventionally the same value.
	assert.deepEqual(identify(-0), identify(0));
});

test('numbers :: non-finite values fold into null', () => {
	assert.deepEqual(identify(NaN), identify(null));
	assert.deepEqual(identify(Infinity), identify(null));
	assert.deepEqual(identify(-Infinity), identify(null));
});

test('bigint :: matches the equivalent number', () => {
	assert.deepEqual(identify(1n), identify(1));
	assert.deepEqual(identify(42n), identify(42));
	assert.deepEqual(identify(0n), identify(0));
});

test('symbols :: dropped like JSON.stringify', () => {
	// Symbols have no real representation; they are omitted as object/map values
	// and fold to null in array/set positions, matching JSON.stringify.
	assert.deepEqual(identify({ a: 1, s: Symbol() }), identify({ a: 1 }));
	assert.deepEqual(identify({ a: 1, s: Symbol('x') }), identify({ a: 1 }));
	assert.deepEqual(identify([1, Symbol(), 2]), identify([1, null, 2]));
	// A bare symbol canonicalizes to the same marker as a bare undefined.
	assert.deepEqual(identify(Symbol()), identify(undefined));
	assert.deepEqual(identify(Symbol('x')), identify(undefined));
});

test('functions :: dropped like JSON.stringify', () => {
	// Functions have no real representation; same drop rules as symbols/undefined.
	assert.deepEqual(identify({ a: 1, f: () => {} }), identify({ a: 1 }));
	assert.deepEqual(identify([1, () => {}, 2]), identify([1, null, 2]));
	// Distinct function bodies are indistinguishable once dropped.
	assert.deepEqual(identify({ f: () => 1 }), identify({ f: () => 2 }));
	assert.deepEqual(identify({ f() {} }), identify({}));
	// A bare function canonicalizes to the same marker as a bare undefined.
	assert.deepEqual(
		identify(() => {}),
		identify(undefined),
	);
});

// ~> toJSON

test('toJSON :: result is serialized in place', () => {
	assert.deepEqual(identify({ toJSON: () => ({ a: 1, b: [2] }) }), identify({ a: 1, b: [2] }));
	assert.deepEqual(identify({ ignored: 99, toJSON: () => ({ a: 1 }) }), identify({ a: 1 }));
	// Primitive and undefined results behave like that primitive / a drop.
	assert.deepEqual(identify({ toJSON: () => 42 }), identify(42));
	assert.deepEqual(identify({ toJSON: () => 'x' }), identify('x'));
	assert.deepEqual(identify({ a: 1, b: { toJSON: () => undefined } }), identify({ a: 1 }));
});

test('toJSON :: URL serializes as its href', () => {
	assert.deepEqual(
		identify(new URL('https://example.com/a?b=1#c')),
		identify('https://example.com/a?b=1#c'),
	);
	assert.deepEqual(identify(new URL('https://a.test/')), identify(new URL('https://a.test/')));
	assert.notDeepEqual(identify(new URL('https://a.test/')), identify(new URL('https://b.test/')));
});

test('toJSON :: builtins with special forms ignore toJSON', () => {
	assert.deepEqual(identify(new Date(0)), 'd0');
	assert.notDeepEqual(identify(new Date(0)), identify(new Date(0).toJSON()));
	assert.deepEqual(identify(Buffer.from([1, 2])), identify(new Uint8Array([1, 2])));
});

test('toJSON :: only applied once, like JSON.stringify', () => {
	const o: any = { a: 1 };
	o.toJSON = () => o;
	assert.deepEqual(identify(o), identify({ a: 1 }));
});

test('toJSON :: result cycling back to the original does not overflow', () => {
	const fresh: any = {};
	fresh.toJSON = () => ({ wrap: fresh });

	const stable: any = {};
	const wrapper = { wrap: stable };
	stable.toJSON = () => wrapper;

	assert.deepEqual(identify(fresh), identify(fresh));
	assert.deepEqual(identify(fresh), identify(stable));
});

test('toJSON :: result resolving to an ancestor closes the cycle', () => {
	const getter: any = {
		get g() {
			return { toJSON: () => getter };
		},
	};
	assert(identify(getter));
	assert.deepEqual(identify(getter), identify(getter));

	const parent: any = {};
	const child: any = { toJSON: () => parent };
	parent.child = child;
	assert(identify(parent));
	assert.deepEqual(identify(parent), identify(parent));

	const root: any = {};
	const mid: any = {};
	root.mid = mid;
	mid.leaf = { toJSON: () => root };
	assert(identify(root));
	assert.deepEqual(identify(root), identify(root));
});

test('toJSON :: ancestor cycles resolve through every container', () => {
	const viaSet: any = { s: new Set() };
	viaSet.s.add({ toJSON: () => viaSet });

	const viaMap: any = { m: new Map() };
	viaMap.m.set('k', { toJSON: () => viaMap });

	const viaArray: any = { arr: [] as unknown[] };
	viaArray.arr.push({ toJSON: () => viaArray });

	assert.deepEqual(identify(viaSet), identify(viaSet));
	assert.deepEqual(identify(viaMap), identify(viaMap));
	assert.deepEqual(identify(viaArray), identify(viaArray));
});

test('toJSON :: array and mutual results still resolve cycles', () => {
	const arr: any = {};
	arr.toJSON = () => [arr];
	assert.deepEqual(identify(arr), identify(arr));

	const a: any = {};
	const b: any = {};
	a.toJSON = () => ({ b });
	b.toJSON = () => ({ a });
	assert.deepEqual(identify(a), identify(a));
	assert.deepEqual(identify(b), identify(b));
});

// ~> Dates & RegExps

test('dates :: equal instants match, different instants differ', () => {
	assert.deepEqual(identify(new Date(0)), identify(new Date(0)));
	assert.deepEqual(identify(new Date(1700000000000)), identify(new Date(1700000000000)));
	assert.notDeepEqual(identify(new Date(0)), identify(new Date(1)));
});

test('dates :: are distinct from their numeric timestamp', () => {
	assert.notDeepEqual(identify(new Date(0)), identify(0));
});

test('regexps :: source and flags both matter', () => {
	assert.deepEqual(identify(/abc/gi), identify(/abc/gi));
	assert.notDeepEqual(identify(/a/), identify(/b/));
	assert.notDeepEqual(identify(/a/), identify(/a/g));
	assert.notDeepEqual(identify(/a/gi), identify(/a/g));
});

// ~> Arrays

test('arrays :: flat equality', () => {
	assert.deepEqual(identify([1, 2, 3]), identify([1, 2, 3]));
});

test('arrays :: empty', () => {
	assert.deepEqual(identify([]), identify([]));
	assert.notDeepEqual(identify([]), identify([0]));
});

test('arrays :: order is significant', () => {
	assert.notDeepEqual(identify([3, 2, 1]), identify([1, 2, 3]));
});

test('arrays :: nested', () => {
	assert.deepEqual(
		identify([
			[3, 2, 1],
			[1, 2, 3],
		]),
		identify([
			[3, 2, 1],
			[1, 2, 3],
		]),
	);
	assert.notDeepEqual(identify([[1], [2, 3]]), identify([[1, 2], [3]]));
});

test('arrays :: circular', () => {
	const arr: unknown[] = [1, 2, 3];
	arr.push(arr);
	assert(identify(arr));
	assert.deepEqual(identify(arr), identify(arr));
});

test('arrays :: undefined elements fold into null', () => {
	assert.deepEqual(identify([1, undefined, 2]), identify([1, null, 2]));
});

test('arrays :: adjacent elements keep their own slots', () => {
	assert.notDeepEqual(identify(['a', 'b']), identify(['ab']));
});

// ~> Objects

test('objects :: basic equality', () => {
	assert.deepEqual(identify({ foo: 'bar' }), identify({ foo: 'bar' }));
});

test('objects :: empty', () => {
	assert.deepEqual(identify({}), identify({}));
	assert.deepEqual(identify({}), identify({ a: undefined }));
});

test('objects :: undefined values are dropped', () => {
	assert.deepEqual(identify({ a: 1, c: undefined, b: 'hello' }), identify({ a: 1, b: 'hello' }));
});

test('objects :: key order does not matter', () => {
	assert.deepEqual(identify({ one: 'one', two: 'two' }), identify({ two: 'two', one: 'one' }));
});

test('objects :: numeric-like keys order independent', () => {
	assert.deepEqual(identify({ 10: 'a', 2: 'b' }), identify({ 2: 'b', 10: 'a' }));
});

test('objects :: nested, key order does not matter at any depth', () => {
	assert.deepEqual(
		identify({ a: { b: 'c' }, d: { e: { f: 'g' } } }),
		identify({ d: { e: { f: 'g' } }, a: { b: 'c' } }),
	);
});

test('objects :: different values differ', () => {
	assert.notDeepEqual(identify({ a: 1, b: 2 }), identify({ a: 1, b: 3 }));
	assert.notDeepEqual(identify({ a: 1 }), identify({ a: 1, b: 2 }));
});

test('objects :: circular', () => {
	const o: Record<string, unknown> = { a: 'b' };
	o.c = o;
	assert(identify(o));
	assert.deepEqual(identify(o), identify(o));
});

test('objects :: partial circular', () => {
	const o = { v: 1 };
	const a = ['a', o];
	assert.deepEqual(identify(a), identify(a));
});

test('objects :: class instances hash by their own keys', () => {
	class Foo {
		a = 1;
		b = 2;
	}
	assert.deepEqual(identify(new Foo()), identify(new Foo()));
	assert.deepEqual(identify(new Foo()), identify({ a: 1, b: 2 }));
});

test('objects :: null-prototype objects are supported', () => {
	const nullProto = Object.assign(Object.create(null), { a: 1, b: 2 });
	assert.deepEqual(identify(nullProto), identify({ a: 1, b: 2 }));
});

test('objects :: a literal "constructor" key still hashes', () => {
	assert.deepEqual(identify({ constructor: 1 }), identify({ constructor: 1 }));
	assert.notDeepEqual(identify({ constructor: 1 }), identify({ constructor: 2 }));
});

test('objects :: null object and null property', () => {
	assert.deepEqual(identify(null), identify(null));
	assert.deepEqual(identify({ f: null }), identify({ f: null }));
	// A null value is distinct from a missing key.
	assert.notDeepEqual(identify({ f: null }), identify({}));
});

test('objects :: deterministic key sorting', () => {
	assert.deepEqual(identify({ b: 2, c: 3, a: 1 }), identify({ a: 1, b: 2, c: 3 }));
});

// ~> Sets

test('sets :: order is significant', () => {
	assert.notDeepEqual(identify(new Set([1, 2, 3])), identify(new Set([3, 2, 1])));
});

test('sets :: order is significant for object members', () => {
	assert.notDeepEqual(
		identify(new Set([{ a: 'a' }, { b: 'b' }])),
		identify(new Set([{ b: 'b' }, { a: 'a' }])),
	);
});

test('sets :: nested', () => {
	assert.deepEqual(
		identify(new Set([new Set([1]), new Set([2])])),
		identify(new Set([new Set([1]), new Set([2])])),
	);
});

test('sets :: circular', () => {
	const s: Set<unknown> = new Set([1, 2, 3]);
	s.add(s);
	assert(identify(s));
	assert.deepEqual(identify(s), identify(s));
});

// ~> Maps

test('maps :: key order does not matter', () => {
	assert.deepEqual(
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

test('maps :: single entry (fast path) is stable', () => {
	assert.deepEqual(identify(new Map([['z', 1]])), identify(new Map([['z', 1]])));
});

test('maps :: mixed key types, order independent', () => {
	assert.deepEqual(
		identify(
			new Map<unknown, unknown>([
				['a', 1],
				[2, 'b'],
				['c', 3],
			]),
		),
		identify(
			new Map<unknown, unknown>([
				[2, 'b'],
				['c', 3],
				['a', 1],
			]),
		),
	);
});

test('maps :: different values differ', () => {
	assert.notDeepEqual(identify(new Map([['a', 1]])), identify(new Map([['a', 2]])));
});

test('maps :: circular', () => {
	const m: Map<string, unknown> = new Map([
		['a', 'b'],
		['c', 'd'],
	]);
	m.set('e', m);
	assert(identify(m));
	assert.deepEqual(identify(m), identify(m));
});

// ~> Cross-type behaviour

test('cross-type :: a Map matches the equivalent plain object', () => {
	assert.deepEqual(identify({ a: 'b' }), identify(new Map([['a', 'b']])));
	assert.deepEqual(
		identify({ a: 1, b: 2 }),
		identify(
			new Map<string, number>([
				['a', 1],
				['b', 2],
			]),
		),
	);
});

test('cross-type :: objects and arrays are distinct', () => {
	assert.notDeepEqual(identify({ a: 'b' }), identify(['a', 'b']));
	assert.notDeepEqual(identify({}), identify([]));
});

test('cross-type :: a Set is distinct from an Array', () => {
	assert.notDeepEqual(identify(new Set([1, 2, 3])), identify([1, 2, 3]));
});

test('cross-type :: a typed array matches the equivalent index-keyed object', () => {
	assert.deepEqual(identify(new Uint8Array([1, 2])), identify({ 0: 1, 1: 2 }));
	assert.deepEqual(identify(new Uint8Array([])), identify({}));
	assert.deepEqual(identify(new Uint8Array([1, 2])), identify(new Int16Array([1, 2])));
});

// ~> Circular & shared references

test('refs :: circular ids are consistent regardless of visitation order', () => {
	let o: Record<string, unknown> = { a: 1, c: 2 };
	o.b = o;
	o.d = new Map(); // the map is seen 2nd
	(o.d as Map<string, unknown>).set('x', o.d);
	assert.deepEqual(Object.keys(o), ['a', 'c', 'b', 'd']);
	const a = identify(o);

	o = { a: 1 };
	o.d = new Map(); // the map is seen first
	(o.d as Map<string, unknown>).set('x', o.d);
	o.b = o;
	o.c = 2;
	assert.deepEqual(Object.keys(o), ['a', 'd', 'b', 'c']);
	const b = identify(o);

	assert.deepEqual(a, b, `${a} === ${b}`);
});

test('refs :: deeply nested circular objects are equal', () => {
	const build = () => {
		const o: Record<string, any> = { b: { c: 123 } };
		o.b.d = o;
		o.x = [9, o.b];
		return o;
	};
	assert.deepEqual(identify(build()), identify(build()));
});

test('refs :: a shared reference equals two distinct equal instances', () => {
	const shared = { v: 1 };
	assert.deepEqual(identify({ x: shared, y: shared }), identify({ x: { v: 1 }, y: { v: 1 } }));
});

test('refs :: each distinct node is only back-referenced when reused', () => {
	const hash = identify({
		a: [[1], [2], [3]],
		b: new Set([new Set([1]), new Set([2]), new Set([3])]),
	});
	assert.doesNotMatch(hash, /~\d+/);
});

test('refs :: circular reference to root', () => {
	const o: any = { id: 123 };
	o.self = o;
	assert(identify(o));
	assert.deepEqual(identify(o), identify(o));
});

test('refs :: nested circular reference to root', () => {
	// A back-reference buried under a node, plus an awkward string to escape.
	const o: any = { label: 'a\n\t"b' };
	o.inner = { root: o };
	assert.deepEqual(identify(o), identify(o));
});

test('refs :: child circular reference', () => {
	const o: any = { id: 1, child: { id: 2 } };
	o.child.self = o.child;
	assert.deepEqual(identify(o), identify(o));
});

test('refs :: nested child circular reference', () => {
	const o: any = { id: 1, child: { id: 2 } };
	o.child.wrap = { ref: o.child };
	assert.deepEqual(identify(o), identify(o));
});

test('refs :: circular objects in an array', () => {
	const o: any = { id: 123 };
	o.list = [o, o];
	assert.deepEqual(identify(o), identify(o));
});

test('refs :: nested circular references in an array', () => {
	const build = () => {
		const o: any = { items: [{ foo: 1 }, { bar: 2 }] };
		o.items[0].self = o.items[0];
		o.items[1].self = o.items[1];
		return o;
	};
	assert.deepEqual(identify(build()), identify(build()));
});

test('refs :: circular arrays', () => {
	const fixture: any = [];
	fixture.push(fixture, fixture);
	assert(identify(fixture));
	assert.deepEqual(identify(fixture), identify(fixture));
});

test('refs :: nested circular arrays', () => {
	const build = () => {
		const arr: any = [];
		arr.push({ foo: 1, back: arr }, { bar: 2, back: arr });
		return arr;
	};
	assert.deepEqual(identify(build()), identify(build()));
});

test('refs :: repeated non-circular references in objects', () => {
	// One shared node behind three keys hashes like three separate equal nodes.
	const shared = { foo: 1, bar: 'abc' };
	assert.deepEqual(
		identify({ a: shared, b: shared, c: shared }),
		identify({
			a: { foo: 1, bar: 'abc' },
			b: { foo: 1, bar: 'abc' },
			c: { foo: 1, bar: 'abc' },
		}),
	);
});

test('refs :: repeated non-circular references in arrays', () => {
	const shared = { foo: 1 };
	assert.deepEqual(identify([shared, shared]), identify([{ foo: 1 }, { foo: 1 }]));
});

// ~> On-the-wire format
//
// These lock the exact serialization. A change here is a breaking change to every
// previously-stored identity, so update deliberately.

test('format :: supported builtins serialize consistently', () => {
	const assertWire = (name: string, input: unknown, expected: string) =>
		assert.deepEqual(identify(input), expected, name);

	assertWire('array', [1, undefined, 'x'], 'an1Lsx');
	assertWire('bigint', 123n, 'n123');
	assertWire('bigint64 array', new BigInt64Array([-1n, 2n]), 'o0n-11n2');
	assertWire('biguint64 array', new BigUint64Array([1n, 2n]), 'o0n11n2');
	assertWire('boolean', true, 'T');
	assertWire('buffer', Buffer.from([1, 2]), 'o0n11n2');
	assertWire('data view', new DataView(new Uint8Array([1, 2]).buffer), 'o');
	assertWire('date', new Date(0), 'd0');
	assertWire('float32 array', new Float32Array([1.5, -2.25]), 'o0n1.51n-2.25');
	assertWire('float64 array', new Float64Array([1.5, -2.25]), 'o0n1.51n-2.25');
	assertWire('int8 array', new Int8Array([-1, 2]), 'o0n-11n2');
	assertWire('int16 array', new Int16Array([-1, 2]), 'o0n-11n2');
	assertWire('int32 array', new Int32Array([-1, 2]), 'o0n-11n2');
	assertWire(
		'map',
		new Map([
			['b', 2],
			['a', 1],
		]),
		'oan1bn2',
	);
	assertWire('null', null, 'L');
	assertWire('object', { b: 2, a: 1 }, 'oan1bn2');
	assertWire('regexp', /ab/gi, 'rabgi');
	assertWire('set', new Set([1, 2]), 'en1n2');
	assertWire('string', 'hello', 'shello');
	assertWire('uint8 array', new Uint8Array([1, 2]), 'o0n11n2');
	assertWire('uint8 clamped array', new Uint8ClampedArray([1, 255]), 'o0n11n255');
	assertWire('uint16 array', new Uint16Array([1, 2]), 'o0n11n2');
	assertWire('uint32 array', new Uint32Array([1, 2]), 'o0n11n2');
	assertWire('custom toJSON', { toJSON: () => ({ a: 1, b: [2] }) }, 'oan1ban2');
	assertWire('url', new URL('https://example.com/a?b=1#c'), 'shttps://example.com/a?b=1#c');
});

test('format :: circular array back-reference', () => {
	const arr: unknown[] = [1, 2, 3];
	arr.push(arr);
	assert.deepEqual(identify(arr), 'an1n2n3~1');
});

test('format :: every element is visited exactly once', () => {
	const c: unknown[] = [1];
	c.push(c);
	const hash = identify({
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
	});
	assert.deepEqual(hash, 'oaobascesdoesfan1~5sg');
});

// ~> Robustness

test('robustness :: very deep input does not overflow', () => {
	let root: Record<string, any> = {};
	let node = root;
	for (let i = 0; i < 1000; i++) {
		node.i = i;
		node.child = {};
		node = node.child;
	}
	assert(identify(root));
	assert.deepEqual(identify(root), identify(root));
});

test('robustness :: unsupported builtins throw', () => {
	assert.throws(() => identify(new WeakMap()));
	assert.throws(() => identify(new WeakSet()));
	assert.throws(() => identify(Promise.resolve()));
	assert.throws(() => identify(new ArrayBuffer(8)));
});

test('robustness :: does not mutate the input', () => {
	const child: any = { foo: 1 };
	child.self = child;
	const o: any = { a: child, b: child };
	identify(o);
	assert.deepEqual(Object.keys(o), ['a', 'b']);
	assert(o.a === child);
	assert(o.b === child);
	assert(child.self === child);
});

test('robustness :: hashing never pollutes Object.prototype', () => {
	identify(JSON.parse('{"__proto__":{"polluted":true}}'));
	identify(JSON.parse('{"constructor":{"prototype":{"polluted":true}}}'));
	assert.deepEqual(({} as Record<string, unknown>).polluted, undefined);
});

// ~> Known limitation

// Cycle detection keys off object reference identity, so two structurally-different
// cyclic shapes that share a referenced node can collapse to the same identity.
test.skip('limitation :: samey circular shapes should not match', () => {
	const o1: any = { a: 1, b: 2 };
	const o2: any = { a: 1, b: 2 };
	o1.c = o1;
	o1.d = o2;
	o2.c = o2;
	const a = identify(o1);
	o2.c = o1;
	const b = identify(o1);
	assert.notDeepEqual(a, b, `${a} != ${b}`);
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

test('fuzz :: identify always returns a string and is idempotent', () => {
	fc.assert(
		fc.property(jsonish, (v) => {
			const hash = identify(v);
			return typeof hash === 'string' && identify(v) === hash;
		}),
		{ numRuns: 1000 },
	);
});

test('fuzz :: object & map key order is irrelevant', () => {
	fc.assert(
		fc.property(jsonish, (v) => identify(v) === identify(reorder(v))),
		{ numRuns: 1000 },
	);
});

test('fuzz :: an object and the equivalent Map share an identity', () => {
	const flatObj = fc.dictionary(keyArb, leafArb, { maxKeys: 6 });
	fc.assert(
		fc.property(flatObj, (o) => {
			const asMap = new Map(Object.entries(o));
			return identify(o) === identify(asMap);
		}),
		{ numRuns: 500 },
	);
});

test('fuzz :: reversing a distinct-element array changes the identity', () => {
	// Distinct integers have distinct identities, so a length >= 2 reversal differs.
	const distinct = fc.uniqueArray(fc.integer(), { minLength: 2, maxLength: 8 });
	fc.assert(
		fc.property(distinct, (xs) => identify(xs) !== identify([...xs].reverse())),
		{ numRuns: 500 },
	);
});

test('fuzz :: adding a defined key changes the identity', () => {
	const flatObj = fc.dictionary(keyArb, leafArb, { maxKeys: 5 });
	fc.assert(
		fc.property(flatObj, fc.string({ minLength: 1 }), leafArb, (o, k, v) => {
			if (k in o || v === undefined) return true; // a dropped/undefined value is a no-op
			const before = identify(o);
			return before !== identify({ ...o, [k]: v });
		}),
		{ numRuns: 500 },
	);
});
