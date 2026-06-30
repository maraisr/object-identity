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
✔ simple        ~  1.1µs @ 870,271 ops/sec ± 0.22%
✔ deep          ~  8.4µs @ 118,807 ops/sec ± 0.01%
✔ deep circular ~  6.0µs @ 166,470 ops/sec ± 0.51%
✔ big           ~ 82.1µs @  12,175 ops/sec ± 1.06%
✔ leafy         ~ 23.8µs @  41,957 ops/sec ± 0.70%
```

<details><summary>All candidates</summary>

```
simple
✔ object-identity                       ~  1.1µs @ 870,271 ops/sec ± 0.22%
✔ safe-stable-stringify                 ~  1.8µs @ 563,781 ops/sec ± 0.46%
✔ ohash                                 ~  3.8µs @ 262,901 ops/sec ± 0.25%
✔ object-hash                           ~ 10.2µs @  98,164 ops/sec ± 1.84%
✔ hash-it †                             ~  3.0µs @ 335,235 ops/sec ± 2.05%
✔ json-stable-stringify                 ~  3.1µs @ 317,679 ops/sec ± 0.30%
✔ fast-json-stable-stringify            ~  2.1µs @ 471,606 ops/sec ± 0.22%
✔ tiny-stable-stringify                 ~  2.5µs @ 403,418 ops/sec ± 1.49%
✔ json-stringify-deterministic          ~  3.2µs @ 313,455 ops/sec ± 0.63%
✔ json-stable-stringify-without-jsonify ~  3.2µs @ 312,450 ops/sec ± 0.59%
✔ json-sorted-stringify                 ~  2.4µs @ 411,299 ops/sec ± 0.86%
✔ canonicalize                          ~  3.7µs @ 271,025 ops/sec ± 0.17%
✔ swr/_internal/stableHash              ~  3.9µs @ 255,223 ops/sec ± 0.60%
✘ @tufjs/canonical-json
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.54x faster than safe-stable-stringify)

deep
✔ object-identity                       ~  8.4µs @ 118,807 ops/sec ± 0.01%
✔ safe-stable-stringify                 ~ 13.3µs @  75,024 ops/sec ± 0.66%
✔ ohash                                 ~ 26.0µs @  38,497 ops/sec ± 0.57%
✔ object-hash                           ~ 56.2µs @  17,807 ops/sec ± 0.95%
✔ hash-it †                             ~ 22.8µs @  43,812 ops/sec ± 0.14%
✔ json-stable-stringify                 ~ 24.1µs @  41,487 ops/sec ± 0.95%
✔ fast-json-stable-stringify            ~ 14.2µs @  70,522 ops/sec ± 0.39%
✔ tiny-stable-stringify                 ~ 16.1µs @  62,039 ops/sec ± 0.56%
✔ json-stringify-deterministic          ~ 23.2µs @  43,102 ops/sec ± 0.15%
✔ json-stable-stringify-without-jsonify ~ 23.3µs @  42,858 ops/sec ± 0.18%
✔ json-sorted-stringify                 ~ 15.8µs @  63,287 ops/sec ± 0.73%
✔ canonicalize                          ~ 26.8µs @  37,383 ops/sec ± 0.16%
✔ swr/_internal/stableHash              ~ 29.0µs @  34,460 ops/sec ± 22.90%
✔ @tufjs/canonical-json                 ~ 34.9µs @  28,625 ops/sec ± 0.17%
───────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.58x faster than safe-stable-stringify)

deep circular
✔ object-identity                       ~  6.0µs @ 166,470 ops/sec ± 0.51%
✔ safe-stable-stringify                 ~  7.5µs @ 132,624 ops/sec ± 0.27%
✔ ohash                                 ~ 17.2µs @  58,116 ops/sec ± 0.49%
✔ object-hash                           ~ 45.7µs @  21,863 ops/sec ± 0.07%
✔ hash-it †                             ~ 16.1µs @  61,985 ops/sec ± 0.31%
✘ json-stable-stringify
✔ fast-json-stable-stringify            ~ 10.2µs @  97,666 ops/sec ± 0.51%
✘ tiny-stable-stringify
✔ json-stringify-deterministic          ~ 15.5µs @  64,604 ops/sec ± 0.41%
✘ json-stable-stringify-without-jsonify
✘ json-sorted-stringify
✘ canonicalize
✔ swr/_internal/stableHash              ~ 15.4µs @  65,066 ops/sec ± 21.11%
✘ @tufjs/canonical-json
───────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.26x faster than safe-stable-stringify)

big
✔ object-identity                       ~  82.1µs @ 12,175 ops/sec ± 1.06%
✔ safe-stable-stringify                 ~ 140.5µs @  7,118 ops/sec ± 0.04%
✔ ohash                                 ~ 304.4µs @  3,285 ops/sec ± 0.53%
✔ object-hash                           ~ 513.2µs @  1,949 ops/sec ± 1.23%
✔ hash-it †                             ~ 276.5µs @  3,617 ops/sec ± 0.61%
✔ json-stable-stringify                 ~ 228.2µs @  4,382 ops/sec ± 1.06%
✔ fast-json-stable-stringify            ~ 164.2µs @  6,091 ops/sec ± 0.56%
✔ tiny-stable-stringify                 ~ 180.0µs @  5,556 ops/sec ± 1.08%
✔ json-stringify-deterministic          ~ 224.9µs @  4,447 ops/sec ± 1.01%
✔ json-stable-stringify-without-jsonify ~ 224.1µs @  4,463 ops/sec ± 0.66%
✔ json-sorted-stringify                 ~ 172.5µs @  5,797 ops/sec ± 0.21%
✔ canonicalize                          ~ 262.7µs @  3,807 ops/sec ± 1.01%
✔ swr/_internal/stableHash              ~ 287.7µs @  3,476 ops/sec ± 16.90%
✔ @tufjs/canonical-json                 ~ 387.7µs @  2,580 ops/sec ± 0.32%
───────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.71x faster than safe-stable-stringify)

leafy
✔ object-identity                       ~  23.8µs @ 41,957 ops/sec ± 0.70%
✔ safe-stable-stringify                 ~  50.3µs @ 19,896 ops/sec ± 0.47%
✔ ohash                                 ~  30.9µs @ 32,336 ops/sec ± 0.38%
✔ object-hash                           ~  87.7µs @ 11,397 ops/sec ± 1.27%
✔ hash-it †                             ~  84.3µs @ 11,860 ops/sec ± 0.97%
✔ json-stable-stringify                 ~ 115.1µs @  8,686 ops/sec ± 0.87%
✔ fast-json-stable-stringify            ~  59.6µs @ 16,765 ops/sec ± 0.11%
✔ tiny-stable-stringify                 ~ 107.8µs @  9,277 ops/sec ± 0.23%
✔ json-stringify-deterministic          ~ 116.5µs @  8,583 ops/sec ± 0.29%
✔ json-stable-stringify-without-jsonify ~ 117.2µs @  8,532 ops/sec ± 0.35%
✔ json-sorted-stringify                 ~ 107.9µs @  9,266 ops/sec ± 0.15%
✔ canonicalize                          ~  93.3µs @ 10,720 ops/sec ± 0.50%
✔ swr/_internal/stableHash              ~ 134.1µs @  7,459 ops/sec ± 31.44%
✔ @tufjs/canonical-json                 ~ 217.2µs @  4,605 ops/sec ± 1.07%
───────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (1.30x faster than ohash)
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
