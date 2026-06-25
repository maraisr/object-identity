import { assert, assertEquals, assertNotEquals, assertNotMatch, assertThrows } from '@std/assert';
import fc from 'fast-check';
import { identify } from '../lib/mod.ts';

Deno.test('exports :: identify is a function', () => {
	assertEquals(typeof identify, 'function');
});

// ~> Primitives

Deno.test('primitives :: are deterministic', () => {
	const stable = (v: unknown) => assertEquals(identify(v), identify(v), `${String(v)} is unstable`);
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

Deno.test('primitives :: distinct values are distinct', () => {
	assertNotEquals(identify(1), identify(2));
	assertNotEquals(identify('a'), identify('b'));
	assertNotEquals(identify(true), identify(false));
	assertNotEquals(identify(1.5), identify(1.50001));
	assertNotEquals(identify(''), identify(' '));
});

Deno.test('primitives :: are distinct from their string form', () => {
	// A number, boolean, or null is its own thing, never its text spelling.
	assertNotEquals(identify(1), identify('1'));
	assertEquals(identify('1'), identify('1'));
	assertNotEquals(identify(true), identify('true'));
	assertNotEquals(identify(null), identify('null'));
	assertNotEquals(identify(undefined), identify('undefined'));
});

Deno.test('strings :: preserve exact content', () => {
	assertEquals(identify('café'), identify('café'));
	assertEquals(identify('a\n\t"b'), identify('a\n\t"b'));
	assertNotEquals(identify('a'), identify('A'));
	assertNotEquals(identify('ab'), identify('a b'));
	// A unicode round-trip over a wide range stays deterministic.
	for (let i = 0; i < 0x2000; i += 7) {
		const s = String.fromCharCode(i);
		assertEquals(identify(s), identify(s));
	}
});

Deno.test('numbers :: float precision is retained', () => {
	assertEquals(identify(0.1 + 0.2), identify(0.30000000000000004));
	assertNotEquals(identify(0.1 + 0.2), identify(0.3));
	assertNotEquals(identify(1), identify(1.0000000000000002));
});

Deno.test('numbers :: signed zero collapses', () => {
	// -0 and 0 are conventionally the same value.
	assertEquals(identify(-0), identify(0));
});

Deno.test('numbers :: non-finite values fold into null', () => {
	assertEquals(identify(NaN), identify(null));
	assertEquals(identify(Infinity), identify(null));
	assertEquals(identify(-Infinity), identify(null));
});

Deno.test('bigint :: matches the equivalent number', () => {
	assertEquals(identify(1n), identify(1));
	assertEquals(identify(42n), identify(42));
	assertEquals(identify(0n), identify(0));
});

Deno.test('symbols :: dropped like JSON.stringify', () => {
	// Symbols have no real representation; they are omitted as object/map values
	// and fold to null in array/set positions, matching JSON.stringify.
	assertEquals(identify({ a: 1, s: Symbol() }), identify({ a: 1 }));
	assertEquals(identify({ a: 1, s: Symbol('x') }), identify({ a: 1 }));
	assertEquals(identify([1, Symbol(), 2]), identify([1, null, 2]));
	// A bare symbol canonicalizes to the same marker as a bare undefined.
	assertEquals(identify(Symbol()), identify(undefined));
	assertEquals(identify(Symbol('x')), identify(undefined));
});

Deno.test('functions :: dropped like JSON.stringify', () => {
	// Functions have no real representation; same drop rules as symbols/undefined.
	assertEquals(identify({ a: 1, f: () => {} }), identify({ a: 1 }));
	assertEquals(identify([1, () => {}, 2]), identify([1, null, 2]));
	// Distinct function bodies are indistinguishable once dropped.
	assertEquals(identify({ f: () => 1 }), identify({ f: () => 2 }));
	assertEquals(identify({ f() {} }), identify({}));
	// A bare function canonicalizes to the same marker as a bare undefined.
	assertEquals(identify(() => {}), identify(undefined));
});

// ~> Dates & RegExps

Deno.test('dates :: equal instants match, different instants differ', () => {
	assertEquals(identify(new Date(0)), identify(new Date(0)));
	assertEquals(identify(new Date(1700000000000)), identify(new Date(1700000000000)));
	assertNotEquals(identify(new Date(0)), identify(new Date(1)));
});

Deno.test('dates :: are distinct from their numeric timestamp', () => {
	assertNotEquals(identify(new Date(0)), identify(0));
});

Deno.test('regexps :: source and flags both matter', () => {
	assertEquals(identify(/abc/gi), identify(/abc/gi));
	assertNotEquals(identify(/a/), identify(/b/));
	assertNotEquals(identify(/a/), identify(/a/g));
	assertNotEquals(identify(/a/gi), identify(/a/g));
});

// ~> Arrays

Deno.test('arrays :: flat equality', () => {
	assertEquals(identify([1, 2, 3]), identify([1, 2, 3]));
});

Deno.test('arrays :: empty', () => {
	assertEquals(identify([]), identify([]));
	assertNotEquals(identify([]), identify([0]));
});

Deno.test('arrays :: order is significant', () => {
	assertNotEquals(identify([3, 2, 1]), identify([1, 2, 3]));
});

Deno.test('arrays :: nested', () => {
	assertEquals(
		identify([[3, 2, 1], [1, 2, 3]]),
		identify([[3, 2, 1], [1, 2, 3]]),
	);
	assertNotEquals(
		identify([[1], [2, 3]]),
		identify([[1, 2], [3]]),
	);
});

Deno.test('arrays :: circular', () => {
	const arr: unknown[] = [1, 2, 3];
	arr.push(arr);
	assert(identify(arr));
	assertEquals(identify(arr), identify(arr));
});

Deno.test('arrays :: undefined elements fold into null', () => {
	assertEquals(identify([1, undefined, 2]), identify([1, null, 2]));
});

Deno.test('arrays :: adjacent elements keep their own slots', () => {
	assertNotEquals(identify(['a', 'b']), identify(['ab']));
});

// ~> Objects

Deno.test('objects :: basic equality', () => {
	assertEquals(identify({ foo: 'bar' }), identify({ foo: 'bar' }));
});

Deno.test('objects :: empty', () => {
	assertEquals(identify({}), identify({}));
	assertEquals(identify({}), identify({ a: undefined }));
});

Deno.test('objects :: undefined values are dropped', () => {
	assertEquals(
		identify({ a: 1, c: undefined, b: 'hello' }),
		identify({ a: 1, b: 'hello' }),
	);
});

Deno.test('objects :: key order does not matter', () => {
	assertEquals(
		identify({ one: 'one', two: 'two' }),
		identify({ two: 'two', one: 'one' }),
	);
});

Deno.test('objects :: numeric-like keys order independent', () => {
	assertEquals(identify({ 10: 'a', 2: 'b' }), identify({ 2: 'b', 10: 'a' }));
});

Deno.test('objects :: nested, key order does not matter at any depth', () => {
	assertEquals(
		identify({ a: { b: 'c' }, d: { e: { f: 'g' } } }),
		identify({ d: { e: { f: 'g' } }, a: { b: 'c' } }),
	);
});

Deno.test('objects :: different values differ', () => {
	assertNotEquals(identify({ a: 1, b: 2 }), identify({ a: 1, b: 3 }));
	assertNotEquals(identify({ a: 1 }), identify({ a: 1, b: 2 }));
});

Deno.test('objects :: circular', () => {
	const o: Record<string, unknown> = { a: 'b' };
	o.c = o;
	assert(identify(o));
	assertEquals(identify(o), identify(o));
});

Deno.test('objects :: partial circular', () => {
	const o = { v: 1 };
	const a = ['a', o];
	assertEquals(identify(a), identify(a));
});

Deno.test('objects :: class instances hash by their own keys', () => {
	class Foo {
		a = 1;
		b = 2;
	}
	assertEquals(identify(new Foo()), identify(new Foo()));
	assertEquals(identify(new Foo()), identify({ a: 1, b: 2 }));
});

Deno.test('objects :: null-prototype objects are supported', () => {
	const nullProto = Object.assign(Object.create(null), { a: 1, b: 2 });
	assertEquals(identify(nullProto), identify({ a: 1, b: 2 }));
});

Deno.test('objects :: a literal "constructor" key still hashes', () => {
	assertEquals(identify({ constructor: 1 }), identify({ constructor: 1 }));
	assertNotEquals(identify({ constructor: 1 }), identify({ constructor: 2 }));
});

Deno.test('objects :: null object and null property', () => {
	assertEquals(identify(null), identify(null));
	assertEquals(identify({ f: null }), identify({ f: null }));
	// A null value is distinct from a missing key.
	assertNotEquals(identify({ f: null }), identify({}));
});

Deno.test('objects :: deterministic key sorting', () => {
	assertEquals(identify({ b: 2, c: 3, a: 1 }), identify({ a: 1, b: 2, c: 3 }));
});

// ~> Sets

Deno.test('sets :: order is significant', () => {
	assertNotEquals(identify(new Set([1, 2, 3])), identify(new Set([3, 2, 1])));
});

Deno.test('sets :: order is significant for object members', () => {
	assertNotEquals(
		identify(new Set([{ a: 'a' }, { b: 'b' }])),
		identify(new Set([{ b: 'b' }, { a: 'a' }])),
	);
});

Deno.test('sets :: nested', () => {
	assertEquals(
		identify(new Set([new Set([1]), new Set([2])])),
		identify(new Set([new Set([1]), new Set([2])])),
	);
});

Deno.test('sets :: circular', () => {
	const s: Set<unknown> = new Set([1, 2, 3]);
	s.add(s);
	assert(identify(s));
	assertEquals(identify(s), identify(s));
});

// ~> Maps

Deno.test('maps :: key order does not matter', () => {
	assertEquals(
		identify(new Map([['a', 'b'], ['c', 'd']])),
		identify(new Map([['c', 'd'], ['a', 'b']])),
	);
});

Deno.test('maps :: single entry (fast path) is stable', () => {
	assertEquals(identify(new Map([['z', 1]])), identify(new Map([['z', 1]])));
});

Deno.test('maps :: mixed key types, order independent', () => {
	assertEquals(
		identify(new Map<unknown, unknown>([['a', 1], [2, 'b'], ['c', 3]])),
		identify(new Map<unknown, unknown>([[2, 'b'], ['c', 3], ['a', 1]])),
	);
});

Deno.test('maps :: different values differ', () => {
	assertNotEquals(
		identify(new Map([['a', 1]])),
		identify(new Map([['a', 2]])),
	);
});

Deno.test('maps :: circular', () => {
	const m: Map<string, unknown> = new Map([['a', 'b'], ['c', 'd']]);
	m.set('e', m);
	assert(identify(m));
	assertEquals(identify(m), identify(m));
});

// ~> Cross-type behaviour

Deno.test('cross-type :: a Map matches the equivalent plain object', () => {
	assertEquals(identify({ a: 'b' }), identify(new Map([['a', 'b']])));
	assertEquals(
		identify({ a: 1, b: 2 }),
		identify(new Map<string, number>([['a', 1], ['b', 2]])),
	);
});

Deno.test('cross-type :: objects and arrays are distinct', () => {
	assertNotEquals(identify({ a: 'b' }), identify(['a', 'b']));
	assertNotEquals(identify({}), identify([]));
});

Deno.test('cross-type :: a Set is distinct from an Array', () => {
	assertNotEquals(identify(new Set([1, 2, 3])), identify([1, 2, 3]));
});

Deno.test('cross-type :: a typed array matches the equivalent index-keyed object', () => {
	assertEquals(identify(new Uint8Array([1, 2])), identify({ 0: 1, 1: 2 }));
	assertEquals(identify(new Uint8Array([])), identify({}));
	assertEquals(identify(new Uint8Array([1, 2])), identify(new Int16Array([1, 2])));
});

// ~> Circular & shared references

Deno.test('refs :: circular ids are consistent regardless of visitation order', () => {
	let o: Record<string, unknown> = { a: 1, c: 2 };
	o.b = o;
	o.d = new Map(); // the map is seen 2nd
	(o.d as Map<string, unknown>).set('x', o.d);
	assertEquals(Object.keys(o), ['a', 'c', 'b', 'd']);
	const a = identify(o);

	o = { a: 1 };
	o.d = new Map(); // the map is seen first
	(o.d as Map<string, unknown>).set('x', o.d);
	o.b = o;
	o.c = 2;
	assertEquals(Object.keys(o), ['a', 'd', 'b', 'c']);
	const b = identify(o);

	assertEquals(a, b, `${a} === ${b}`);
});

Deno.test('refs :: deeply nested circular objects are equal', () => {
	const build = () => {
		const o: Record<string, any> = { b: { c: 123 } };
		o.b.d = o;
		o.x = [9, o.b];
		return o;
	};
	assertEquals(identify(build()), identify(build()));
});

Deno.test('refs :: a shared reference equals two distinct equal instances', () => {
	const shared = { v: 1 };
	assertEquals(
		identify({ x: shared, y: shared }),
		identify({ x: { v: 1 }, y: { v: 1 } }),
	);
});

Deno.test('refs :: each distinct node is only back-referenced when reused', () => {
	const hash = identify({
		a: [[1], [2], [3]],
		b: new Set([new Set([1]), new Set([2]), new Set([3])]),
	});
	assertNotMatch(hash, /~\d+/);
});

Deno.test('refs :: circular reference to root', () => {
	const o: any = { id: 123 };
	o.self = o;
	assert(identify(o));
	assertEquals(identify(o), identify(o));
});

Deno.test('refs :: nested circular reference to root', () => {
	// A back-reference buried under a node, plus an awkward string to escape.
	const o: any = { label: 'a\n\t"b' };
	o.inner = { root: o };
	assertEquals(identify(o), identify(o));
});

Deno.test('refs :: child circular reference', () => {
	const o: any = { id: 1, child: { id: 2 } };
	o.child.self = o.child;
	assertEquals(identify(o), identify(o));
});

Deno.test('refs :: nested child circular reference', () => {
	const o: any = { id: 1, child: { id: 2 } };
	o.child.wrap = { ref: o.child };
	assertEquals(identify(o), identify(o));
});

Deno.test('refs :: circular objects in an array', () => {
	const o: any = { id: 123 };
	o.list = [o, o];
	assertEquals(identify(o), identify(o));
});

Deno.test('refs :: nested circular references in an array', () => {
	const build = () => {
		const o: any = { items: [{ foo: 1 }, { bar: 2 }] };
		o.items[0].self = o.items[0];
		o.items[1].self = o.items[1];
		return o;
	};
	assertEquals(identify(build()), identify(build()));
});

Deno.test('refs :: circular arrays', () => {
	const fixture: any = [];
	fixture.push(fixture, fixture);
	assert(identify(fixture));
	assertEquals(identify(fixture), identify(fixture));
});

Deno.test('refs :: nested circular arrays', () => {
	const build = () => {
		const arr: any = [];
		arr.push({ foo: 1, back: arr }, { bar: 2, back: arr });
		return arr;
	};
	assertEquals(identify(build()), identify(build()));
});

Deno.test('refs :: repeated non-circular references in objects', () => {
	// One shared node behind three keys hashes like three separate equal nodes.
	const shared = { foo: 1, bar: 'abc' };
	assertEquals(
		identify({ a: shared, b: shared, c: shared }),
		identify({
			a: { foo: 1, bar: 'abc' },
			b: { foo: 1, bar: 'abc' },
			c: { foo: 1, bar: 'abc' },
		}),
	);
});

Deno.test('refs :: repeated non-circular references in arrays', () => {
	const shared = { foo: 1 };
	assertEquals(
		identify([shared, shared]),
		identify([{ foo: 1 }, { foo: 1 }]),
	);
});

// ~> On-the-wire format
//
// These lock the exact serialization. A change here is a breaking change to every
// previously-stored identity, so update deliberately.

Deno.test('format :: circular array back-reference', () => {
	const arr: unknown[] = [1, 2, 3];
	arr.push(arr);
	assertEquals(identify(arr), 'an1n2n3~1');
});

Deno.test('format :: every element is visited exactly once', () => {
	const c: unknown[] = [1];
	c.push(c);
	const hash = identify({
		a: { b: ['c', new Set(['d', new Map([['e', 'f']]), c, 'g'])] },
	});
	assertEquals(hash, 'oaobascesdoesfan1~5sg');
});

// ~> Robustness

Deno.test('robustness :: very deep input does not overflow', () => {
	let root: Record<string, any> = {};
	let node = root;
	for (let i = 0; i < 1000; i++) {
		node.i = i;
		node.child = {};
		node = node.child;
	}
	assert(identify(root));
	assertEquals(identify(root), identify(root));
});

Deno.test('robustness :: unsupported builtins throw', () => {
	assertThrows(() => identify(new WeakMap()));
	assertThrows(() => identify(new WeakSet()));
	assertThrows(() => identify(Promise.resolve()));
	assertThrows(() => identify(new ArrayBuffer(8)));
});

Deno.test('robustness :: does not mutate the input', () => {
	const child: any = { foo: 1 };
	child.self = child;
	const o: any = { a: child, b: child };
	identify(o);
	assertEquals(Object.keys(o), ['a', 'b']);
	assert(o.a === child);
	assert(o.b === child);
	assert(child.self === child);
});

Deno.test('robustness :: hashing never pollutes Object.prototype', () => {
	identify(JSON.parse('{"__proto__":{"polluted":true}}'));
	identify(JSON.parse('{"constructor":{"prototype":{"polluted":true}}}'));
	assertEquals(({} as Record<string, unknown>).polluted, undefined);
});

// ~> Known limitation

// Cycle detection keys off object reference identity, so two structurally-different
// cyclic shapes that share a referenced node can collapse to the same identity.
Deno.test.ignore('limitation :: samey circular shapes should not match', () => {
	const o1: any = { a: 1, b: 2 };
	const o2: any = { a: 1, b: 2 };
	o1.c = o1;
	o1.d = o2;
	o2.c = o2;
	const a = identify(o1);
	o2.c = o1;
	const b = identify(o1);
	assertNotEquals(a, b, `${a} != ${b}`);
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

Deno.test('fuzz :: identify always returns a string and is idempotent', () => {
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

Deno.test('fuzz :: an object and the equivalent Map share an identity', () => {
	const flatObj = fc.dictionary(keyArb, leafArb, { maxKeys: 6 });
	fc.assert(
		fc.property(flatObj, (o) => {
			const asMap = new Map(Object.entries(o));
			return identify(o) === identify(asMap);
		}),
		{ numRuns: 500 },
	);
});

Deno.test('fuzz :: reversing a distinct-element array changes the identity', () => {
	// Distinct integers have distinct identities, so a length >= 2 reversal differs.
	const distinct = fc.uniqueArray(fc.integer(), { minLength: 2, maxLength: 8 });
	fc.assert(
		fc.property(distinct, (xs) => identify(xs) !== identify([...xs].reverse())),
		{ numRuns: 500 },
	);
});

Deno.test('fuzz :: adding a defined key changes the identity', () => {
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
