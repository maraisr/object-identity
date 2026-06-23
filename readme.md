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
- 🪶 **Lightweight** — a mere 387B and no
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
object-identity                609.3 ns     1,641,000 (591.9 ns … 858.9 ns) 607.5 ns 858.9 ns 858.9 ns
object-hash                      7.2 µs       139,400 (  6.4 µs … 437.8 µs)   6.8 µs  22.5 µs  36.6 µs
json-stable-stringify            1.8 µs       554,600 (  1.7 µs …   3.2 µs)   1.7 µs   3.2 µs   3.2 µs
tiny-stable-stringify            1.6 µs       607,600 (  1.6 µs …   1.8 µs)   1.7 µs   1.8 µs   1.8 µs

summary
  object-identity
     2.70x faster than tiny-stable-stringify
     2.96x faster than json-stable-stringify
    11.77x faster than object-hash
```

> ^ `object-identity` is not as feature-full it's alternatives, specifically around `function`
> values and other node builtins. So take this benchmark with a grain of salt, as it's only testing
> "json-like" payloads.

## License

MIT © [Marais Rossouw](https://marais.io)
