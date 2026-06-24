<div align="left">

<samp>

# object-identity [![licenses](https://licenses.dev/b/npm/object-identity?style=dark)](https://licenses.dev/npm/object-identity)

</samp>

**A tiny, fast utility that canonicalizes any value into a stable identity, so structurally-equal
inputs match regardless of key order.**

<br>
<br>

<sup>

This is free to use software, but if you do like it, consider supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=gray)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label&color=gray)](https://www.buymeacoffee.com/marais)

</sup>

</div>

`identify` turns any JSON-like value into a short, stable string. The same _shape_ always produces
the same string, with keys in any order and a plain object treated the same as an equivalent `Map`.
That makes it useful as a cache key, or for deduping structurally-equal values.

## ⚡ Features

- 🧬 **Canonical.** The same shape always produces the same id.
- 🌀 **Deep and cycle-safe.** Handles nested objects, arrays, sets, maps, and circular references.
- 🏎 **Fast.** See the [benchmarks](#-benchmark).
- 🪶 **Tiny.** Around 436 B minified and gzipped, with zero
  [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

> **Behavior:**
>
> - key order within objects and maps doesn't matter
> - element order within arrays and sets does
> - a plain object and a `Map` with the same entries share one identity
> - cycles are handled; exotic builtins (typed arrays, promises, …) throw

## ⚙️ Install

- **npm** is available as [`object-identity`](https://www.npmjs.com/package/object-identity)
- **JSR** is available as [`@mr/object-identity`](https://jsr.io/@mr/object-identity)

## 🚀 Usage

```ts
import { identify } from 'object-identity';

// same shape, different key order, same id
identify({ a: 1, b: 2 }) === identify({ b: 2, a: 1 }); // true

// a plain object and an equivalent Map produce the same id
identify({ a: 'b' }) === identify(new Map([['a', 'b']])); // true

// nesting, Sets, Dates, and RegExps are all supported.
// use it as a cache key, or a dedupe signal
const key = identify({ user: 7, filters: new Set(['active', 'new']) });
```

## 💨 Benchmark

```
benchmark               time/iter (avg)        iter/s      (min … max)      p75      p99     p995
----------------------- --------------- ------------- ---------------- -------- -------- --------
object-identity                602.7 ns     1,659,000 (544.3 ns … 990.8 ns) 608.5 ns 990.8 ns 990.8 ns
object-hash                      7.2 µs       138,000 (  6.3 µs … 491.2 µs)   7.0 µs  19.4 µs  43.9 µs
json-stable-stringify            1.7 µs       591,200 (  1.6 µs …   2.2 µs)   1.7 µs   2.2 µs   2.2 µs
tiny-stable-stringify            1.6 µs       611,600 (  1.6 µs …   2.2 µs)   1.6 µs   2.2 µs   2.2 µs

summary
  object-identity
     2.71x faster than tiny-stable-stringify
     2.81x faster than json-stable-stringify
    12.02x faster than object-hash
```

> ^ `object-identity` only handles JSON-like data by design. It won't fingerprint functions or every
> Node builtin the way some alternatives do, so these numbers only reflect the payloads it targets.

## License

MIT © [Marais Rossouw](https://marais.io)
