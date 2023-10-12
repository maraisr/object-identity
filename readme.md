<div align="left">

<samp>

# object-identity

</samp>

**A utility that provides a stable identity of an object**

<a href="https://npm-stat.com/charts.html?package=object-identity">
  <img src="https://badgen.net/npm/dm/object-identity?color=black&label=npm%20downloads" alt="js downloads">
</a>
<a href="https://unpkg.com/object-identity/index.mjs">
  <img src="https://img.badgesize.io/https://unpkg.com/object-identity/index.mjs?compression=gzip&label=gzip&color=black" alt="gzip size" />
</a>
<a href="https://unpkg.com/object-identity/index.mjs">
  <img src="https://img.badgesize.io/https://unpkg.com/object-identity/index.mjs?compression=brotli&label=brotli&color=black" alt="brotli size" />
</a>

<br>
<br>

<sup>

This is free to use software, but if you do like it, consisder supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=gray)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label&color=gray)](https://www.buymeacoffee.com/marais)

</sup>

</div>

## ⚡ Features

- ✅ **Intuitive**
- 🌪 **Recursive/Circular support**
- 🏎 **Performant** — check the [benchmarks](#-benchmark).
- 🪶 **Lightweight** — a mere 387B and no [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## 🚀 Usage

```ts
import { identify } from 'object-identity';

// ~> identity the object
const id1 = identify({ a: new Set(['b', 'c', new Map([['d', 'e']])]) });
// ~> an entirely different object, but structurally the same
const id2 = identify({ a: new Set(['b', 'c', new Map([['e', 'e']])]) });

// they should equal
assert.toEqual(hashA, hashB);
```

## 💨 Benchmark

> via the [`/bench`](/bench) directory with Node v18.16.1 (Apple M1 Pro)

```
✔ object-identity           ~ 55,101,604 ops/sec ± 0.16%
✔ object-hash               ~    103,820 ops/sec ± 0.01%
✔ json-stable-stringify     ~    608,119 ops/sec ± 0.01%
✔ object-identity :: hashed ~ 46,650,067 ops/sec ± 0.05%
✔ object-hash :: hashed     ~     50,966 ops/sec ± 0.01%
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function` values and other node
> builtins. So take this benchmark with a grain of salt, as it's only testing "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
