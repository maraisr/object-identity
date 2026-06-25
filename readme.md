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
✔ simple        ~  1.1µs @ 945,104 ops/sec ± 0.16%
✔ deep          ~  8.2µs @ 121,541 ops/sec ± 1.34%
✔ deep circular ~  5.3µs @ 187,820 ops/sec ± 0.18%
✔ big           ~ 80.2µs @  12,476 ops/sec ± 0.12%
✔ leafy         ~ 23.0µs @  43,393 ops/sec ± 0.74%
```

<details><summary>All candidates</summary>

```
simple
✔ object-identity                       ~ 1.1µs @ 945,104 ops/sec ± 0.16%
✔ safe-stable-stringify                 ~ 1.7µs @ 597,318 ops/sec ± 0.12%
✔ ohash                                 ~ 3.5µs @ 285,053 ops/sec ± 0.16%
✔ object-hash                           ~ 9.7µs @ 102,648 ops/sec ± 1.63%
✔ hash-it †                             ~ 2.7µs @ 364,144 ops/sec ± 2.48%
✔ json-stable-stringify                 ~ 3.0µs @ 329,228 ops/sec ± 0.03%
✔ fast-json-stable-stringify            ~ 2.0µs @ 491,338 ops/sec ± 0.16%
✔ tiny-stable-stringify                 ~ 2.3µs @ 432,540 ops/sec ± 0.07%
✔ json-stringify-deterministic          ~ 3.5µs @ 285,498 ops/sec ± 1.10%
✔ json-stable-stringify-without-jsonify ~ 3.1µs @ 321,857 ops/sec ± 2.79%
✔ json-sorted-stringify                 ~ 2.3µs @ 428,881 ops/sec ± 1.60%
✔ canonicalize                          ~ 3.4µs @ 298,473 ops/sec ± 0.44%
✘ @tufjs/canonical-json
─────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (58.2% faster than safe-stable-stringify)

deep
✔ object-identity                       ~  8.2µs @ 121,541 ops/sec ± 1.34%
✔ safe-stable-stringify                 ~ 13.4µs @  74,884 ops/sec ± 2.03%
✔ ohash                                 ~ 26.1µs @  38,307 ops/sec ± 0.25%
✔ object-hash                           ~ 55.8µs @  17,923 ops/sec ± 0.23%
✔ hash-it †                             ~ 21.3µs @  47,041 ops/sec ± 1.80%
✔ json-stable-stringify                 ~ 23.1µs @  43,253 ops/sec ± 1.96%
✔ fast-json-stable-stringify            ~ 13.7µs @  72,892 ops/sec ± 1.60%
✔ tiny-stable-stringify                 ~ 16.0µs @  62,547 ops/sec ± 2.16%
✔ json-stringify-deterministic          ~ 24.5µs @  40,785 ops/sec ± 0.76%
✔ json-stable-stringify-without-jsonify ~ 23.0µs @  43,476 ops/sec ± 1.99%
✔ json-sorted-stringify                 ~ 15.3µs @  65,257 ops/sec ± 0.48%
✔ canonicalize                          ~ 27.0µs @  36,974 ops/sec ± 0.78%
✔ @tufjs/canonical-json                 ~ 35.5µs @  28,130 ops/sec ± 0.96%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (62.3% faster than safe-stable-stringify)

deep circular
✔ object-identity                       ~  5.3µs @ 187,820 ops/sec ± 0.18%
✔ safe-stable-stringify                 ~  7.2µs @ 138,610 ops/sec ± 0.34%
✔ ohash                                 ~ 16.4µs @  61,113 ops/sec ± 0.58%
✔ object-hash                           ~ 44.5µs @  22,492 ops/sec ± 0.37%
✔ hash-it †                             ~ 15.2µs @  65,867 ops/sec ± 0.10%
✘ json-stable-stringify
✘ fast-json-stable-stringify
✘ tiny-stable-stringify
✘ json-stringify-deterministic
✘ json-stable-stringify-without-jsonify
✘ json-sorted-stringify
✘ canonicalize
✘ @tufjs/canonical-json
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (35.5% faster than safe-stable-stringify)

big
✔ object-identity                       ~  80.2µs @ 12,476 ops/sec ± 0.12%
✔ safe-stable-stringify                 ~ 134.8µs @  7,418 ops/sec ± 0.70%
✔ ohash                                 ~ 288.8µs @  3,463 ops/sec ± 0.30%
✔ object-hash                           ~ 488.0µs @  2,049 ops/sec ± 1.21%
✔ hash-it †                             ~ 258.4µs @  3,870 ops/sec ± 0.01%
✔ json-stable-stringify                 ~ 212.1µs @  4,715 ops/sec ± 0.26%
✔ fast-json-stable-stringify            ~ 155.9µs @  6,416 ops/sec ± 0.44%
✔ tiny-stable-stringify                 ~ 165.5µs @  6,043 ops/sec ± 0.27%
✔ json-stringify-deterministic          ~ 261.1µs @  3,830 ops/sec ± 0.14%
✔ json-stable-stringify-without-jsonify ~ 213.3µs @  4,688 ops/sec ± 0.04%
✔ json-sorted-stringify                 ~ 169.8µs @  5,888 ops/sec ± 1.58%
✔ canonicalize                          ~ 256.6µs @  3,897 ops/sec ± 0.13%
✔ @tufjs/canonical-json                 ~ 371.5µs @  2,692 ops/sec ± 0.09%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (68.2% faster than safe-stable-stringify)

leafy
✔ object-identity                       ~  23.0µs @ 43,393 ops/sec ± 0.74%
✔ safe-stable-stringify                 ~  49.0µs @ 20,402 ops/sec ± 0.54%
✔ ohash                                 ~  30.7µs @ 32,569 ops/sec ± 2.43%
✔ object-hash                           ~  83.9µs @ 11,922 ops/sec ± 2.53%
✔ hash-it †                             ~  81.8µs @ 12,230 ops/sec ± 1.05%
✔ json-stable-stringify                 ~ 112.2µs @  8,912 ops/sec ± 1.22%
✔ fast-json-stable-stringify            ~  56.2µs @ 17,781 ops/sec ± 1.54%
✔ tiny-stable-stringify                 ~ 106.3µs @  9,410 ops/sec ± 1.94%
✔ json-stringify-deterministic          ~ 125.3µs @  7,982 ops/sec ± 0.41%
✔ json-stable-stringify-without-jsonify ~ 112.4µs @  8,895 ops/sec ± 2.44%
✔ json-sorted-stringify                 ~ 102.7µs @  9,740 ops/sec ± 0.12%
✔ canonicalize                          ~  89.0µs @ 11,239 ops/sec ± 0.67%
✔ @tufjs/canonical-json                 ~ 208.9µs @  4,786 ops/sec ± 0.50%
──────────────────────────────────────────────────────────────────────────
⭐︎ object-identity (33.2% faster than ohash)
```

</details>
<!-- END BENCHMARK -->

> `object-identity` only handles mainly JSON-like data by design. It won't fingerprint functions or
> every Node builtin the way some alternatives do, so these numbers only reflect the payloads it
> targets.

## License

MIT © [Marais Rossouw](https://marais.io)
