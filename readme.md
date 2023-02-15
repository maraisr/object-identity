<div align="right">

# `object-identity`

<br />
<br />

`npm add object-identity` hashes objects

<span>
<a href="https://github.com/maraisr/object-identity/actions/workflows/ci.yml">
	<img src="https://github.com/maraisr/object-identity/actions/workflows/ci.yml/badge.svg"/>
</a>
<a href="https://npm-stat.com/charts.html?package=object-identity">
	<img src="https://badgen.net/npm/dw/object-identity?labelColor=black&color=black&cache=600" alt="downloads"/>
</a>
<a href="https://packagephobia.com/result?p=object-identity">
	<img src="https://badgen.net/packagephobia/install/object-identity?labelColor=black&color=black" alt="size"/>
</a>
<a href="https://bundlephobia.com/result?p=object-identity">
	<img src="https://badgen.net/bundlephobia/minzip/object-identity?labelColor=black&color=black" alt="size"/>
</a>
</span>

<br />
<br />
</div>

## ⚡ Features

- ✅ **Intuitive**
- 🌪 **Recursive/Circular support**
- 🏎 **Performant** — check the [benchmarks](#-benchmark).
- 🪶 **Lightweight** — a mere 503B and no [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## 🚀 Usage

```ts
import { createHash } from 'node:crypto';
import { identify } from 'object-identity';

// ~> Some user defined hasher
const hasher = (value) => createHash('sha1').update(value).digest('hex');

// ~> identity the object
const hashA = identify({ a: new Set(['b', 'c', new Map([['d', 'e']])]) }, hasher);
// ~> an entirely different object, but structurally the same
const hashB = identify({ a: new Set(['b', 'c', new Map([['e', 'e']])]) }, hasher);

// they should equal
assert.toEqual(hashA, hashB);
```

## 💨 Benchmark

> via the [`/bench`](/bench) directory with Node v17.4.0

```
benchmark :: hashed
  object-hash          x  25,773 ops/sec ±2.49% (89 runs sampled)
  object-identity^     x 270,940 ops/sec ±1.28% (92 runs sampled)

benchmark :: passed through
  object-hash          x  65,894 ops/sec ±0.81% (89 runs sampled)
  object-identity^     x 775,302 ops/sec ±0.29% (95 runs sampled)
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function` values and other node builtins.
> So take this benchmark with a grain of salt, as it's only testing "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
