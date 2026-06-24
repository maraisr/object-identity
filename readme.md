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
- 🪶 **Tiny.** Around 555B minified and gzipped, with zero
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

- **simple** a complete nested object, with an arrays and other mixed primitives.
- **deep** a long, narrow nesting chain.
- **deep circular** the deep chain, but every node points back and the tail closes the loop.
- **big** a wide object: hundreds of keys, but with small values.
- **leafy** a large flat array of mixed primitives.

<!-- BEGIN BENCHMARK -->

```
✔ simple        ~   1.1µs @ 905,989 ops/sec ± 0.75%
✔ deep          ~   9.4µs @ 106,803 ops/sec ± 0.50%
✔ deep circular ~   5.9µs @ 169,953 ops/sec ± 1.28%
✔ big           ~ 140.0µs @   7,143 ops/sec ± 0.81%
✔ leafy         ~  23.6µs @  42,430 ops/sec ± 0.59%
```

<details><summary>All candidates</summary>

```
simple
✔ object-identity                       ~ 1.1µs @ 905,989 ops/sec ± 0.75%
✔ safe-stable-stringify                 ~ 1.7µs @ 578,151 ops/sec ± 0.40%
✔ ohash                                 ~ 3.5µs @ 285,422 ops/sec ± 0.19%
✔ object-hash                           ~ 9.7µs @ 103,295 ops/sec ± 1.45%
✔ hash-it †                             ~ 2.9µs @ 341,608 ops/sec ± 1.55%
✔ json-stable-stringify                 ~ 3.0µs @ 329,697 ops/sec ± 0.20%
✔ fast-json-stable-stringify            ~ 2.0µs @ 495,893 ops/sec ± 0.52%
✔ tiny-stable-stringify                 ~ 2.4µs @ 424,881 ops/sec ± 0.52%
✔ json-stringify-deterministic          ~ 3.3µs @ 303,377 ops/sec ± 0.08%
✔ json-stable-stringify-without-jsonify ~ 3.0µs @ 329,644 ops/sec ± 0.61%
✔ json-sorted-stringify                 ~ 2.4µs @ 417,033 ops/sec ± 2.05%
✔ canonicalize                          ~ 3.5µs @ 283,645 ops/sec ± 0.90%
✘ @tufjs/canonical-json
─────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (56.7% faster than safe-stable-stringify)

deep
✔ object-identity                       ~  9.4µs @ 106,803 ops/sec ± 0.50%
✔ safe-stable-stringify                 ~ 13.6µs @  73,421 ops/sec ± 3.02%
✔ ohash                                 ~ 27.0µs @  37,063 ops/sec ± 6.73%
✔ object-hash                           ~ 51.2µs @  19,547 ops/sec ± 2.02%
✔ hash-it †                             ~ 21.6µs @  46,238 ops/sec ± 2.52%
✔ json-stable-stringify                 ~ 22.8µs @  43,806 ops/sec ± 2.16%
✔ fast-json-stable-stringify            ~ 13.6µs @  73,774 ops/sec ± 1.64%
✔ tiny-stable-stringify                 ~ 15.6µs @  64,214 ops/sec ± 1.00%
✔ json-stringify-deterministic          ~ 23.1µs @  43,210 ops/sec ± 1.88%
✔ json-stable-stringify-without-jsonify ~ 22.5µs @  44,512 ops/sec ± 1.70%
✔ json-sorted-stringify                 ~ 15.4µs @  64,922 ops/sec ± 0.99%
✔ canonicalize                          ~ 25.2µs @  39,606 ops/sec ± 1.98%
✔ @tufjs/canonical-json                 ~ 34.1µs @  29,287 ops/sec ± 2.38%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (44.8% faster than fast-json-stable-stringify)

deep circular
✔ object-identity                       ~  5.9µs @ 169,953 ops/sec ± 1.28%
✔ safe-stable-stringify                 ~  7.3µs @ 136,608 ops/sec ± 0.02%
✔ ohash                                 ~ 16.4µs @  60,983 ops/sec ± 0.40%
✔ object-hash                           ~ 42.4µs @  23,583 ops/sec ± 1.25%
✔ hash-it †                             ~ 15.1µs @  66,432 ops/sec ± 1.18%
✘ json-stable-stringify
✘ fast-json-stable-stringify
✘ tiny-stable-stringify
✘ json-stringify-deterministic
✘ json-stable-stringify-without-jsonify
✘ json-sorted-stringify
✘ canonicalize
✘ @tufjs/canonical-json
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (24.4% faster than safe-stable-stringify)

big
✔ object-identity                       ~ 140.0µs @ 7,143 ops/sec ± 0.81%
✔ safe-stable-stringify                 ~ 137.5µs @ 7,274 ops/sec ± 1.89%
✔ ohash                                 ~ 288.2µs @ 3,470 ops/sec ± 0.51%
✔ object-hash                           ~ 479.9µs @ 2,084 ops/sec ± 1.63%
✔ hash-it †                             ~ 277.3µs @ 3,606 ops/sec ± 0.50%
✔ json-stable-stringify                 ~ 227.2µs @ 4,402 ops/sec ± 3.02%
✔ fast-json-stable-stringify            ~ 150.4µs @ 6,650 ops/sec ± 0.98%
✔ tiny-stable-stringify                 ~ 164.3µs @ 6,086 ops/sec ± 0.27%
✔ json-stringify-deterministic          ~ 255.3µs @ 3,917 ops/sec ± 0.51%
✔ json-stable-stringify-without-jsonify ~ 209.2µs @ 4,780 ops/sec ± 0.39%
✔ json-sorted-stringify                 ~ 163.7µs @ 6,111 ops/sec ± 0.32%
✔ canonicalize                          ~ 239.8µs @ 4,171 ops/sec ± 0.83%
✔ @tufjs/canonical-json                 ~ 364.4µs @ 2,744 ops/sec ± 0.63%
─────────────────────────────────────────────────────────────────────────
⭐︎ safe-stable-stringify (1.8% faster than object-identity)

leafy
✔ object-identity                       ~  23.6µs @ 42,430 ops/sec ± 0.59%
✔ safe-stable-stringify                 ~  51.0µs @ 19,595 ops/sec ± 0.26%
✔ ohash                                 ~  31.8µs @ 31,478 ops/sec ± 1.37%
✔ object-hash                           ~  85.6µs @ 11,682 ops/sec ± 0.12%
✔ hash-it †                             ~  83.6µs @ 11,967 ops/sec ± 0.17%
✔ json-stable-stringify                 ~ 104.6µs @  9,556 ops/sec ± 0.66%
✔ fast-json-stable-stringify            ~  54.4µs @ 18,386 ops/sec ± 1.25%
✔ tiny-stable-stringify                 ~ 101.9µs @  9,816 ops/sec ± 0.13%
✔ json-stringify-deterministic          ~ 118.3µs @  8,453 ops/sec ± 0.51%
✔ json-stable-stringify-without-jsonify ~ 108.6µs @  9,211 ops/sec ± 0.45%
✔ json-sorted-stringify                 ~ 101.7µs @  9,829 ops/sec ± 0.13%
✔ canonicalize                          ~  86.6µs @ 11,552 ops/sec ± 0.85%
✔ @tufjs/canonical-json                 ~ 203.7µs @  4,909 ops/sec ± 1.25%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (34.8% faster than ohash)
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
