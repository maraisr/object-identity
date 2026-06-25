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
- 🪶 **Tiny.** Around 538B minified and gzipped, with zero
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
✔ simple        ~  1.1µs @ 921,139 ops/sec ± 1.00%
✔ deep          ~  8.0µs @ 125,088 ops/sec ± 0.38%
✔ deep circular ~  5.5µs @ 182,804 ops/sec ± 3.19%
✔ big           ~ 85.1µs @  11,753 ops/sec ± 1.08%
✔ leafy         ~ 24.2µs @  41,307 ops/sec ± 0.17%
```

<details><summary>All candidates</summary>

```
simple
✔ object-identity                       ~  1.1µs @ 921,139 ops/sec ± 1.00%
✔ safe-stable-stringify                 ~  1.8µs @ 560,158 ops/sec ± 0.91%
✔ ohash                                 ~  3.6µs @ 280,116 ops/sec ± 3.31%
✔ object-hash                           ~ 10.0µs @  99,840 ops/sec ± 0.57%
✔ hash-it †                             ~  2.9µs @ 342,544 ops/sec ± 2.11%
✔ json-stable-stringify                 ~  3.1µs @ 326,547 ops/sec ± 0.03%
✔ fast-json-stable-stringify            ~  2.0µs @ 488,763 ops/sec ± 0.31%
✔ tiny-stable-stringify                 ~  2.4µs @ 413,527 ops/sec ± 2.38%
✔ json-stringify-deterministic          ~  3.4µs @ 291,605 ops/sec ± 2.59%
✔ json-stable-stringify-without-jsonify ~  3.1µs @ 325,385 ops/sec ± 3.23%
✔ json-sorted-stringify                 ~  2.4µs @ 412,511 ops/sec ± 1.40%
✔ canonicalize                          ~  3.4µs @ 296,935 ops/sec ± 0.24%
✘ @tufjs/canonical-json
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.64x faster than safe-stable-stringify)

deep
✔ object-identity                       ~  8.0µs @ 125,088 ops/sec ± 0.38%
✔ safe-stable-stringify                 ~ 12.9µs @  77,399 ops/sec ± 1.32%
✔ ohash                                 ~ 24.7µs @  40,429 ops/sec ± 0.95%
✔ object-hash                           ~ 53.3µs @  18,759 ops/sec ± 1.67%
✔ hash-it †                             ~ 21.1µs @  47,501 ops/sec ± 1.24%
✔ json-stable-stringify                 ~ 22.8µs @  43,850 ops/sec ± 1.34%
✔ fast-json-stable-stringify            ~ 13.6µs @  73,448 ops/sec ± 0.84%
✔ tiny-stable-stringify                 ~ 16.5µs @  60,768 ops/sec ± 4.79%
✔ json-stringify-deterministic          ~ 23.3µs @  42,915 ops/sec ± 1.65%
✔ json-stable-stringify-without-jsonify ~ 22.4µs @  44,583 ops/sec ± 1.17%
✔ json-sorted-stringify                 ~ 15.4µs @  64,737 ops/sec ± 0.73%
✔ canonicalize                          ~ 25.4µs @  39,367 ops/sec ± 1.58%
✔ @tufjs/canonical-json                 ~ 33.7µs @  29,649 ops/sec ± 1.79%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.62x faster than safe-stable-stringify)

deep circular
✔ object-identity                       ~  5.5µs @ 182,804 ops/sec ± 3.19%
✔ safe-stable-stringify                 ~  7.3µs @ 136,207 ops/sec ± 2.78%
✔ ohash                                 ~ 16.3µs @  61,293 ops/sec ± 0.40%
✔ object-hash                           ~ 44.6µs @  22,433 ops/sec ± 1.20%
✔ hash-it †                             ~ 15.3µs @  65,287 ops/sec ± 0.38%
✘ json-stable-stringify
✘ fast-json-stable-stringify
✘ tiny-stable-stringify
✘ json-stringify-deterministic
✘ json-stable-stringify-without-jsonify
✘ json-sorted-stringify
✘ canonicalize
✘ @tufjs/canonical-json
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.34x faster than safe-stable-stringify)

big
✔ object-identity                       ~  85.1µs @ 11,753 ops/sec ± 1.08%
✔ safe-stable-stringify                 ~ 140.5µs @  7,119 ops/sec ± 0.17%
✔ ohash                                 ~ 294.4µs @  3,397 ops/sec ± 0.81%
✔ object-hash                           ~ 499.8µs @  2,001 ops/sec ± 1.02%
✔ hash-it †                             ~ 272.9µs @  3,665 ops/sec ± 0.90%
✔ json-stable-stringify                 ~ 220.2µs @  4,541 ops/sec ± 1.63%
✔ fast-json-stable-stringify            ~ 155.9µs @  6,415 ops/sec ± 0.69%
✔ tiny-stable-stringify                 ~ 165.3µs @  6,050 ops/sec ± 0.02%
✔ json-stringify-deterministic          ~ 262.1µs @  3,815 ops/sec ± 0.12%
✔ json-stable-stringify-without-jsonify ~ 221.9µs @  4,506 ops/sec ± 0.79%
✔ json-sorted-stringify                 ~ 173.8µs @  5,754 ops/sec ± 0.04%
✔ canonicalize                          ~ 248.1µs @  4,030 ops/sec ± 0.24%
✔ @tufjs/canonical-json                 ~ 369.1µs @  2,709 ops/sec ± 0.02%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.65x faster than safe-stable-stringify)

leafy
✔ object-identity                       ~  24.2µs @ 41,307 ops/sec ± 0.17%
✔ safe-stable-stringify                 ~  50.7µs @ 19,733 ops/sec ± 0.26%
✔ ohash                                 ~  30.4µs @ 32,871 ops/sec ± 1.66%
✔ object-hash                           ~  82.7µs @ 12,096 ops/sec ± 0.04%
✔ hash-it †                             ~  80.2µs @ 12,467 ops/sec ± 0.62%
✔ json-stable-stringify                 ~ 108.4µs @  9,227 ops/sec ± 0.08%
✔ fast-json-stable-stringify            ~  56.5µs @ 17,685 ops/sec ± 1.11%
✔ tiny-stable-stringify                 ~ 103.3µs @  9,678 ops/sec ± 0.41%
✔ json-stringify-deterministic          ~ 121.2µs @  8,248 ops/sec ± 0.13%
✔ json-stable-stringify-without-jsonify ~ 111.9µs @  8,936 ops/sec ± 0.12%
✔ json-sorted-stringify                 ~ 103.9µs @  9,626 ops/sec ± 0.35%
✔ canonicalize                          ~  90.2µs @ 11,085 ops/sec ± 0.15%
✔ @tufjs/canonical-json                 ~ 209.4µs @  4,776 ops/sec ± 0.34%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.26x faster than ohash)
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
