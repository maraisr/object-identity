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
-	🪶 **Lightweight** — a mere 387B and no [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## 🚀 Usage

```ts
import { createHash } from 'node:crypto';
import { identify } from 'object-identity';

// ~> Some user defined hasher
const hash = (value) => {
  const id = identify(value);
  return createHash('sha1').update(id).digest('hex');
}

// ~> identity the object
const hashA = hash({ a: new Set(['b', 'c', new Map([['d', 'e']])]) });
// ~> an entirely different object, but structurally the same
const hashB = hash({ a: new Set(['b', 'c', new Map([['e', 'e']])]) });

// they should equal
assert.toEqual(hashA, hashB);
```

## 💨 Benchmark

> via the [`/bench`](/bench) directory with Node v16.20.0 (Apple M1 Pro)

```
benchmark :: hashed
  object-hash          x  60,632 ops/sec ±0.25% (98 runs sampled)
  object-identity      x 569,618 ops/sec ±0.16% (100 runs sampled)

benchmark :: passed through
  object-hash          x   120,081 ops/sec ±0.18% (100 runs sampled)
  object-identity      x 1,111,031 ops/sec ±0.09% (101 runs sampled)
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function` values and other node
> builtins. So take this benchmark with a grain of salt, as it's only testing "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
