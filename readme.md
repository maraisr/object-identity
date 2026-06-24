<div align="left">

<samp>

# object-identity [![licenses](https://licenses.dev/b/npm/object-identity?style=dark)](https://licenses.dev/npm/object-identity)

</samp>

**A tiny, fast utility that canonicalizes any value into a stable identity, for structurally
equality.**

<br>
<br>

<sup>

This is free to use software, but if you do like it, consider supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=gray)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label&color=gray)](https://www.buymeacoffee.com/marais)

</sup>

</div>

## ⚡ Features

- 🧬 **Canonical.** The same shape always produces the same id.
- 🌀 **Deep and cycle-safe.** Handles nested objects, arrays, sets, maps, and circular references.
- 🏎 **Fast.** See the [benchmarks](#-benchmark).
- 🪶 **Tiny.** Around 436B minified and gzipped, with zero
  [dependencies](https://npm.anvaka.com/#/view/2d/object-identity/).

## ⚙️ Install

- **npm** — available as [`object-identity`](https://www.npmjs.com/package/object-identity)
- **JSR** — available as [`@mr/object-identity`](https://jsr.io/@mr/object-identity)

## 🚀 Usage

```ts
import { identify } from 'object-identity';

// same shape, different key order, same id
identify({ a: 1, b: 2 }) === identify({ b: 2, a: 1 }); // true

// a plain object and an equivalent Map produce the same id
identify({ a: 'b' }) === identify(new Map([['a', 'b']])); // true

// nesting, Sets, Dates, and RegExps are all supported
const key = identify({ user: 7, filters: new Set(['active', 'new']) });
```

## 💨 Benchmark

```
| benchmark               | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| ----------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |
| object-identity         |        573.0 ns |     1,745,000 | (540.1 ns … 607.1 ns) | 585.2 ns | 607.1 ns | 607.1 ns |
| object-hash             |          6.7 µs |       149,000 | (  6.2 µs … 164.9 µs) |   6.5 µs |   8.0 µs |  21.2 µs |
| json-stable-stringify   |          1.7 µs |       588,400 | (  1.6 µs …   2.9 µs) |   1.6 µs |   2.9 µs |   2.9 µs |
| tiny-stable-stringify   |          1.6 µs |       639,600 | (  1.5 µs …   1.6 µs) |   1.6 µs |   1.6 µs |   1.6 µs |

summary
  object-identity
     2.73x faster than tiny-stable-stringify
     2.97x faster than json-stable-stringify
    11.71x faster than object-hash
```

> ^ `object-identity` only handles JSON-like data by design. It won't fingerprint functions or every
> Node builtin the way some alternatives do, so these numbers only reflect the payloads it targets.

## License

MIT © [Marais Rossouw](https://marais.io)
