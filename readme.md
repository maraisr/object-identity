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
- 🪶 **Tiny.** Around 535B minified and gzipped, with zero
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
✔ simple        ~  1.1µs @ 932,332 ops/sec ± 0.76%
✔ deep          ~  8.0µs @ 124,505 ops/sec ± 2.85%
✔ deep circular ~  5.5µs @ 183,042 ops/sec ± 0.16%
✔ big           ~ 80.2µs @  12,467 ops/sec ± 0.42%
✔ leafy         ~ 23.7µs @  42,223 ops/sec ± 0.63%
```

<details><summary>All candidates</summary>

```
simple
✔ object-identity                       ~ 1.1µs @ 932,332 ops/sec ± 0.76%
✔ safe-stable-stringify                 ~ 1.7µs @ 588,871 ops/sec ± 0.67%
✔ ohash                                 ~ 3.5µs @ 285,750 ops/sec ± 0.28%
✔ object-hash                           ~ 9.7µs @ 102,617 ops/sec ± 2.08%
✔ hash-it †                             ~ 2.8µs @ 361,547 ops/sec ± 2.62%
✔ json-stable-stringify                 ~ 3.1µs @ 325,737 ops/sec ± 0.08%
✔ fast-json-stable-stringify            ~ 2.1µs @ 480,206 ops/sec ± 0.44%
✔ tiny-stable-stringify                 ~ 2.4µs @ 409,949 ops/sec ± 1.60%
✔ json-stringify-deterministic          ~ 3.1µs @ 326,067 ops/sec ± 2.55%
✔ json-stable-stringify-without-jsonify ~ 3.0µs @ 329,660 ops/sec ± 0.25%
✔ json-sorted-stringify                 ~ 2.3µs @ 429,194 ops/sec ± 0.54%
✔ canonicalize                          ~ 3.5µs @ 284,416 ops/sec ± 1.62%
✘ @tufjs/canonical-json
─────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.58x faster than safe-stable-stringify)

deep
✔ object-identity                       ~  8.0µs @ 124,505 ops/sec ± 2.85%
✔ safe-stable-stringify                 ~ 13.6µs @  73,292 ops/sec ± 0.45%
✔ ohash                                 ~ 25.6µs @  39,078 ops/sec ± 0.79%
✔ object-hash                           ~ 53.3µs @  18,748 ops/sec ± 1.73%
✔ hash-it †                             ~ 21.1µs @  47,506 ops/sec ± 1.23%
✔ json-stable-stringify                 ~ 22.9µs @  43,649 ops/sec ± 1.24%
✔ fast-json-stable-stringify            ~ 14.4µs @  69,262 ops/sec ± 0.14%
✔ tiny-stable-stringify                 ~ 16.4µs @  60,994 ops/sec ± 0.38%
✔ json-stringify-deterministic          ~ 22.5µs @  44,468 ops/sec ± 1.25%
✔ json-stable-stringify-without-jsonify ~ 22.7µs @  43,964 ops/sec ± 0.53%
✔ json-sorted-stringify                 ~ 16.1µs @  61,935 ops/sec ± 0.64%
✔ canonicalize                          ~ 26.7µs @  37,508 ops/sec ± 0.76%
✔ @tufjs/canonical-json                 ~ 34.5µs @  29,020 ops/sec ± 1.45%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.70x faster than safe-stable-stringify)

deep circular
✔ object-identity                       ~  5.5µs @ 183,042 ops/sec ± 0.16%
✔ safe-stable-stringify                 ~  7.2µs @ 139,264 ops/sec ± 0.32%
✔ ohash                                 ~ 16.6µs @  60,357 ops/sec ± 0.66%
✔ object-hash                           ~ 44.1µs @  22,688 ops/sec ± 1.50%
✔ hash-it †                             ~ 15.1µs @  66,295 ops/sec ± 1.39%
✘ json-stable-stringify
✔ fast-json-stable-stringify            ~ 10.0µs @ 100,160 ops/sec ± 0.67%
✘ tiny-stable-stringify
✔ json-stringify-deterministic          ~ 14.8µs @  67,354 ops/sec ± 1.50%
✘ json-stable-stringify-without-jsonify
✘ json-sorted-stringify
✘ canonicalize
✘ @tufjs/canonical-json
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.31x faster than safe-stable-stringify)

big
✔ object-identity                       ~  80.2µs @ 12,467 ops/sec ± 0.42%
✔ safe-stable-stringify                 ~ 135.1µs @  7,404 ops/sec ± 0.88%
✔ ohash                                 ~ 289.9µs @  3,449 ops/sec ± 0.63%
✔ object-hash                           ~ 490.0µs @  2,041 ops/sec ± 1.51%
✔ hash-it †                             ~ 258.9µs @  3,862 ops/sec ± 0.48%
✔ json-stable-stringify                 ~ 214.5µs @  4,662 ops/sec ± 0.69%
✔ fast-json-stable-stringify            ~ 156.8µs @  6,379 ops/sec ± 0.69%
✔ tiny-stable-stringify                 ~ 174.3µs @  5,736 ops/sec ± 0.24%
✔ json-stringify-deterministic          ~ 223.6µs @  4,471 ops/sec ± 0.38%
✔ json-stable-stringify-without-jsonify ~ 215.6µs @  4,639 ops/sec ± 0.21%
✔ json-sorted-stringify                 ~ 165.3µs @  6,049 ops/sec ± 0.13%
✔ canonicalize                          ~ 245.5µs @  4,073 ops/sec ± 0.44%
✔ @tufjs/canonical-json                 ~ 369.7µs @  2,705 ops/sec ± 0.11%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.68x faster than safe-stable-stringify)

leafy
✔ object-identity                       ~  23.7µs @ 42,223 ops/sec ± 0.63%
✔ safe-stable-stringify                 ~  51.0µs @ 19,622 ops/sec ± 0.66%
✔ ohash                                 ~  30.6µs @ 32,645 ops/sec ± 0.38%
✔ object-hash                           ~  82.1µs @ 12,183 ops/sec ± 0.10%
✔ hash-it †                             ~  83.0µs @ 12,050 ops/sec ± 0.42%
✔ json-stable-stringify                 ~ 113.6µs @  8,800 ops/sec ± 0.02%
✔ fast-json-stable-stringify            ~  59.2µs @ 16,901 ops/sec ± 1.06%
✔ tiny-stable-stringify                 ~ 103.5µs @  9,661 ops/sec ± 0.11%
✔ json-stringify-deterministic          ~ 111.5µs @  8,965 ops/sec ± 0.00%
✔ json-stable-stringify-without-jsonify ~ 113.7µs @  8,796 ops/sec ± 2.00%
✔ json-sorted-stringify                 ~ 107.3µs @  9,324 ops/sec ± 0.97%
✔ canonicalize                          ~  92.4µs @ 10,821 ops/sec ± 1.36%
✔ @tufjs/canonical-json                 ~ 207.2µs @  4,826 ops/sec ± 0.72%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.29x faster than ohash)
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
