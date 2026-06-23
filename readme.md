<div align="left">

<samp>

# object-identity [![licenses](https://licenses.dev/b/npm/object-identity?style=dark)](https://licenses.dev/npm/object-identity)

</samp>

**A utility that provides a stable identity of an object**

<br>
<br>

<sup>

This is free to use software, but if you do like it, consider supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=gray)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label&color=gray)](https://www.buymeacoffee.com/marais)

</sup>

</div>

## ⚡ Features

- ✅ **Intuitive**
- 🌪 **Recursive/Circular support**
- 🏎 **Performant** — check the [benchmarks](#-benchmark).
- 🪶 **Lightweight** — around 1.4 kB generated ESM and no
  [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## ⚙️ Install

- **npm** — available as [`object-identity`](https://www.npmjs.com/package/object-identity)
- **JSR** — available as [`@mr/object-identity`](https://jsr.io/@mr/object-identity)

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

```
benchmark               time/iter (avg)        iter/s      (min … max)      p75      p99     p995
----------------------- --------------- ------------- ---------------- -------- -------- --------
object-identity                557.4 ns     1,794,000 (538.1 ns … 888.2 ns) 556.9 ns 593.5 ns 888.2 ns
object-hash                      6.7 µs       150,300 (  6.4 µs …   7.3 µs)   6.7 µs   7.3 µs   7.3 µs
json-stable-stringify            1.7 µs       598,400 (  1.6 µs …   2.3 µs)   1.7 µs   2.3 µs   2.3 µs
tiny-stable-stringify            1.6 µs       628,200 (  1.6 µs …   1.7 µs)   1.6 µs   1.7 µs   1.7 µs

summary
  object-identity
     2.86x faster than tiny-stable-stringify
     3.00x faster than json-stable-stringify
    11.94x faster than object-hash
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function`
> values and other node builtins. So take this benchmark with a grain of salt, as it's only testing
> "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
