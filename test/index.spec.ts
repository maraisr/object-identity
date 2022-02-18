import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { identity } from '..';

// ~ API

const API = suite('exports');

API('should export a function', () => {
    assert.type(identity, 'function');
});

API.run();

// ~ Arrays

const Arrays = suite('array');

Arrays('flat', () => {
    assert.equal(identity([1, 2, 3]), identity([1, 2, 3]));
});

Arrays('flat ~ key order', () => {
    assert.equal(identity([3, 2, 1]), identity([1, 2, 3]));
});

Arrays('nested', () => {
    assert.equal(identity([[3, 2, 1], [1, 2, 3]]), identity([[3, 2, 1], [1, 2, 3]]));
});

Arrays.skip('circular', () => {
    const arr = [1, 2, 3];
    // @ts-ignore
    arr.push(arr);
    assert.not.throws(() => identity(arr), /Maximum call stack size exceeded/);
    assert.equal(identity(arr), identity(arr));
});

Arrays.run();

// ~ Objects

const Objects = suite('object');

Objects('basic', () => {
    assert.equal(identity({ foo: "bar" }), identity({ foo: "bar" }));
});

Objects('key ordering', () => {
    assert.equal(identity({ one: "one", two: "two" }), identity({ two: "two", one: "one" }));
});

Objects('complex keys', () => {
    assert.equal(identity({ [123]: "one", [Date.now()]: "two" }), identity({ [123]: "one", [Date.now()]: "two" }));
});

Objects('nested', () => {
    assert.equal(identity({ a: { b: "c" }, d: { e: { f: "g" } } }), identity({ d: { e: { f: "g" } }, a: { b: "c" } }));
});

Objects.skip('circular', () => {
    const o = { a: "b" };
    o['c'] = o;
    assert.not.throws(() => identity(o), /Maximum call stack size exceeded/);
    assert.equal(identity(o), identity(o));
});

Objects('same values between types shouldnt match', () => {
    assert.not.equal(identity({ a: 'b' }), identity(['a', 'b']));
});

Objects.run();

// ~ Sets

const Sets = suite('set');

Sets('basic', () => {
    assert.equal(identity(new Set([1, 2, 3])), identity(new Set([3, 2, 1])));
});

Sets('objects', () => {
    assert.equal(identity(new Set([{ a: "a" }, { b: "b" }])), identity(new Set([{ b: "b" }, { a: "a" }])));
});

Sets.skip('circular', () => {
    const s = new Set([1, 2, 3]);
    // @ts-ignore
    s.add(s);
    assert.not.throws(() => identity(s), /Maximum call stack size exceeded/);
    assert.equal(identity(s), identity(s));
});

Sets.run();

// ~ Maps

const Maps = suite('map');

Sets('basic', () => {
    assert.equal(identity(new Map([['a', 'b'], ['c', 'd']])), identity(new Map([['c', 'd'], ['a', 'b']])));
});

Sets.skip('circular', () => {
    const m = new Map([['a', 'b'], ['c', 'd']]);
    // @ts-ignore
    m.set('e', m);
    assert.not.throws(() => identity(m), /Maximum call stack size exceeded/);
    assert.equal(identity(m), identity(m));
});

Maps.run();

// ~ Values

const Values = suite('values');

Values('primitives', () => {
    const t = (v) => assert.equal(identity(v), identity(v), `Value ${v} should have hashed correctly.`);

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

Values.run();
