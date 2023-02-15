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

-	✅ **Intuitive**
-	🌪 **Recursive/Circular support**
-	🏎 **Performant** — check the [benchmarks](#-benchmark).
-	🪶 **Lightweight** — a mere 503B and no [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

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

> via the [`/bench`](/bench) directory with Node v17.9.1 (Apple M1 Pro)

```
benchmark :: hashed
  object-hash          x  56,899 ops/sec ±0.28% (99 runs sampled)
  object-identity^     x 500,733 ops/sec ±0.30% (98 runs sampled)

benchmark :: passed through
  object-hash          x   123,748 ops/sec ±0.22% (94 runs sampled)
  object-identity^     x 1,027,478 ops/sec ±0.18% (99 runs sampled)
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function` values and other node
> builtins. So take this benchmark with a grain of salt, as it's only testing "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
