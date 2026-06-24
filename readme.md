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
✔ simple        ~   1.1µs @ 910,961 ops/sec ± 0.30%
✔ deep          ~   8.7µs @ 115,162 ops/sec ± 1.80%
✔ deep circular ~   5.7µs @ 175,990 ops/sec ± 0.22%
✔ big           ~ 140.9µs @   7,095 ops/sec ± 0.08%
✔ leafy         ~  23.0µs @  43,393 ops/sec ± 1.10%
```

<details><summary>All candidates</summary>

```
simple
✔ object-identity                       ~ 1.1µs @ 910,961 ops/sec ± 0.30%
✔ safe-stable-stringify                 ~ 1.7µs @ 593,432 ops/sec ± 0.15%
✔ ohash                                 ~ 3.5µs @ 286,954 ops/sec ± 0.00%
✔ object-hash                           ~ 9.5µs @ 105,175 ops/sec ± 1.84%
✔ hash-it †                             ~ 2.7µs @ 364,963 ops/sec ± 2.26%
✔ json-stable-stringify                 ~ 3.2µs @ 315,125 ops/sec ± 0.64%
✔ fast-json-stable-stringify            ~ 2.0µs @ 495,655 ops/sec ± 0.52%
✔ tiny-stable-stringify                 ~ 2.3µs @ 429,496 ops/sec ± 0.00%
✔ json-stringify-deterministic          ~ 3.3µs @ 303,470 ops/sec ± 0.08%
✔ json-stable-stringify-without-jsonify ~ 3.1µs @ 323,737 ops/sec ± 1.89%
✔ canonicalize                          ~ 3.3µs @ 303,716 ops/sec ± 0.10%
✘ @tufjs/canonical-json
─────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (53.5% faster than safe-stable-stringify)

deep
✔ object-identity                       ~  8.7µs @ 115,162 ops/sec ± 1.80%
✔ safe-stable-stringify                 ~ 13.6µs @  73,438 ops/sec ± 0.24%
✔ ohash                                 ~ 26.1µs @  38,257 ops/sec ± 0.05%
✔ object-hash                           ~ 53.8µs @  18,572 ops/sec ± 0.72%
✔ hash-it †                             ~ 21.7µs @  46,100 ops/sec ± 1.80%
✔ json-stable-stringify                 ~ 22.5µs @  44,539 ops/sec ± 1.46%
✔ fast-json-stable-stringify            ~ 13.4µs @  74,806 ops/sec ± 0.88%
✔ tiny-stable-stringify                 ~ 15.5µs @  64,717 ops/sec ± 0.50%
✔ json-stringify-deterministic          ~ 22.7µs @  44,121 ops/sec ± 1.10%
✔ json-stable-stringify-without-jsonify ~ 22.1µs @  45,243 ops/sec ± 1.22%
✔ canonicalize                          ~ 25.0µs @  39,935 ops/sec ± 1.16%
✔ @tufjs/canonical-json                 ~ 33.5µs @  29,867 ops/sec ± 1.31%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (53.9% faster than fast-json-stable-stringify)

deep circular
✔ object-identity                       ~  5.7µs @ 175,990 ops/sec ± 0.22%
✔ safe-stable-stringify                 ~  7.2µs @ 138,163 ops/sec ± 1.36%
✔ ohash                                 ~ 16.9µs @  59,172 ops/sec ± 2.12%
✔ object-hash                           ~ 44.8µs @  22,345 ops/sec ± 1.22%
✔ hash-it †                             ~ 15.4µs @  64,834 ops/sec ± 2.48%
✘ json-stable-stringify
✘ fast-json-stable-stringify
✘ tiny-stable-stringify
✘ json-stringify-deterministic
✘ json-stable-stringify-without-jsonify
✘ canonicalize
✘ @tufjs/canonical-json
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (27.4% faster than safe-stable-stringify)

big
✔ object-identity                       ~ 140.9µs @ 7,095 ops/sec ± 0.08%
✔ safe-stable-stringify                 ~ 135.6µs @ 7,377 ops/sec ± 1.24%
✔ ohash                                 ~ 292.0µs @ 3,424 ops/sec ± 0.02%
✔ object-hash                           ~ 469.1µs @ 2,132 ops/sec ± 1.36%
✔ hash-it †                             ~ 258.4µs @ 3,871 ops/sec ± 0.22%
✔ json-stable-stringify                 ~ 209.4µs @ 4,776 ops/sec ± 0.50%
✔ fast-json-stable-stringify            ~ 150.4µs @ 6,647 ops/sec ± 0.68%
✔ tiny-stable-stringify                 ~ 164.6µs @ 6,076 ops/sec ± 0.06%
✔ json-stringify-deterministic          ~ 268.9µs @ 3,719 ops/sec ± 0.90%
✔ json-stable-stringify-without-jsonify ~ 220.8µs @ 4,529 ops/sec ± 0.10%
✔ canonicalize                          ~ 240.3µs @ 4,162 ops/sec ± 0.61%
✔ @tufjs/canonical-json                 ~ 369.3µs @ 2,708 ops/sec ± 0.38%
─────────────────────────────────────────────────────────────────────────
⭐︎ safe-stable-stringify (4.0% faster than object-identity)

leafy
✔ object-identity                       ~  23.0µs @ 43,393 ops/sec ± 1.10%
✔ safe-stable-stringify                 ~  48.8µs @ 20,510 ops/sec ± 0.61%
✔ ohash                                 ~  31.7µs @ 31,549 ops/sec ± 1.41%
✔ object-hash                           ~  84.5µs @ 11,837 ops/sec ± 1.50%
✔ hash-it †                             ~  79.5µs @ 12,585 ops/sec ± 0.26%
✔ json-stable-stringify                 ~ 105.9µs @  9,439 ops/sec ± 0.26%
✔ fast-json-stable-stringify            ~  54.8µs @ 18,234 ops/sec ± 1.77%
✔ tiny-stable-stringify                 ~ 101.9µs @  9,810 ops/sec ± 0.51%
✔ json-stringify-deterministic          ~ 123.0µs @  8,133 ops/sec ± 1.66%
✔ json-stable-stringify-without-jsonify ~ 114.9µs @  8,702 ops/sec ± 0.25%
✔ canonicalize                          ~  91.0µs @ 10,986 ops/sec ± 0.06%
✔ @tufjs/canonical-json                 ~ 215.3µs @  4,646 ops/sec ± 0.31%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (37.5% faster than ohash)
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
