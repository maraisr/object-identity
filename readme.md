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
- 🪶 **Lightweight** — a mere 387B and no [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## 🚀 Usage

```ts
import { createHash } from 'node:crypto';
import { identify } from 'object-identity';

// ~> Some user defined hasher
const hash = (value) => {
  const id = identify(value);
  return createHash('sha1').update(id).digest('hex');
};

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
✔ object-identity           ~ 40,500,419 ops/sec ± 0.18%
✔ object-hash               ~    137,954 ops/sec ± 0.01%
✔ object-identity :: hashed ~ 35,892,692 ops/sec ± 0.03%
✔ object-hash :: hashed     ~     60,243 ops/sec ± 0.01%
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function` values and other node
> builtins. So take this benchmark with a grain of salt, as it's only testing "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
