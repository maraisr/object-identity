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

| benchmark                             | time/iter (avg) | iter/s    | (min … max)           | p75      | p99      | p995     |
| ------------------------------------- | --------------- | --------- | --------------------- | -------- | -------- | -------- |
| object-identity                       | 582.4 ns        | 1,717,000 | (540.4 ns … 807.5 ns) | 588.1 ns | 807.5 ns | 807.5 ns |
| object-hash                           | 8.3 µs          | 120,500   | ( 7.4 µs … 211.7 µs)  | 8.0 µs   | 15.4 µs  | 46.0 µs  |
| ohash                                 | 3.1 µs          | 320,500   | ( 2.8 µs … 208.7 µs)  | 3.1 µs   | 3.5 µs   | 4.7 µs   |
| @liqd-js/fast-object-hash             | 2.5 µs          | 403,400   | ( 2.4 µs … 2.9 µs)    | 2.5 µs   | 2.9 µs   | 2.9 µs   |
| hash-it †                             | 2.5 µs          | 406,700   | ( 2.4 µs … 3.0 µs)    | 2.5 µs   | 3.0 µs   | 3.0 µs   |
| json-stable-stringify                 | 1.7 µs          | 600,300   | ( 1.6 µs … 1.8 µs)    | 1.7 µs   | 1.8 µs   | 1.8 µs   |
| fast-json-stable-stringify            | 1.3 µs          | 749,800   | ( 1.3 µs … 1.5 µs)    | 1.3 µs   | 1.5 µs   | 1.5 µs   |
| faster-stable-stringify               | 1.6 µs          | 630,500   | ( 1.5 µs … 1.8 µs)    | 1.6 µs   | 1.8 µs   | 1.8 µs   |
| tiny-stable-stringify                 | 1.6 µs          | 644,200   | ( 1.5 µs … 1.6 µs)    | 1.6 µs   | 1.6 µs   | 1.6 µs   |
| safe-stable-stringify                 | 1.2 µs          | 850,700   | ( 1.2 µs … 1.2 µs)    | 1.2 µs   | 1.2 µs   | 1.2 µs   |
| json-stringify-deterministic          | 2.8 µs          | 359,400   | ( 2.7 µs … 2.9 µs)    | 2.8 µs   | 2.9 µs   | 2.9 µs   |
| json-stable-stringify-without-jsonify | 1.6 µs          | 639,400   | ( 1.5 µs … 1.6 µs)    | 1.6 µs   | 1.6 µs   | 1.6 µs   |
| @emeraldsquad/json-stable-stringify   | 1.6 µs          | 638,000   | ( 1.5 µs … 1.6 µs)    | 1.6 µs   | 1.6 µs   | 1.6 µs   |
| canonicalize                          | 1.8 µs          | 570,100   | ( 1.7 µs … 1.8 µs)    | 1.8 µs   | 1.8 µs   | 1.8 µs   |
| json-canonicalize                     | 1.6 µs          | 612,100   | ( 1.6 µs … 1.7 µs)    | 1.7 µs   | 1.7 µs   | 1.7 µs   |
| canonical-json                        | 1.7 µs          | 587,100   | ( 1.7 µs … 1.8 µs)    | 1.7 µs   | 1.8 µs   | 1.8 µs   |
| @tufjs/canonical-json                 | 1.2 µs          | 805,100   | ( 1.2 µs … 1.3 µs)    | 1.2 µs   | 1.3 µs   | 1.3 µs   |

```
summary
  object-identity
     2.02x faster than safe-stable-stringify
     2.13x faster than @tufjs/canonical-json
     2.29x faster than fast-json-stable-stringify
     2.67x faster than tiny-stable-stringify
     2.69x faster than json-stable-stringify-without-jsonify
     2.69x faster than @emeraldsquad/json-stable-stringify
     2.72x faster than faster-stable-stringify
     2.81x faster than json-canonicalize
     2.86x faster than json-stable-stringify
     2.92x faster than canonical-json
     3.01x faster than canonicalize
     4.22x faster than hash-it †
     4.26x faster than @liqd-js/fast-object-hash
     4.78x faster than json-stringify-deterministic
     5.36x faster than ohash
    14.25x faster than object-hash
```

> ^ `object-identity` only handles JSON-like data by design. It won't fingerprint functions or every
> Node builtin the way some alternatives do, so these numbers only reflect the payloads it targets.
>
> `†` no canonicalization-only step, so its time includes hashing.

## License

MIT © [Marais Rossouw](https://marais.io)
